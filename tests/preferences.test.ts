import assert from 'node:assert/strict';
import { test } from 'node:test';
import { attendees } from '../src/data/attendees';
import { offsiteData } from '../src/data/offsite';
import { createPreferencesStore, parsePreferences, PREFERENCES_KEY, type PreferenceStorage } from '../src/state/preferences-store';

function memoryStorage(initial: string | null = null) {
  let raw = initial;
  return { read: () => raw, getItem: async () => raw, setItem: async (_key: string, value: string) => { raw = value; } };
}

test('onboarding contains seven unique attendees and excludes Christian without editing the guide', () => {
  assert.equal(attendees.length, 7);
  assert.equal(new Set(attendees.map((p) => p.id)).size, 7);
  assert(!attendees.some((p) => p.name === 'Christian Falch'));
  assert(offsiteData.travel.some((p) => p.name === 'Christian Falch'));
});

test('identity, saved places and packed items survive a new store instance', async () => {
  const disk = memoryStorage();
  const store = createPreferencesStore(disk);
  await store.hydrate();
  await store.selectAttendee('hirbod');
  await store.togglePlace('fuglen');
  await store.togglePacking('Raincoat');
  const reopened = createPreferencesStore(disk);
  await reopened.hydrate();
  assert.equal(reopened.getSnapshot().value.attendeeId, 'hirbod');
  assert.deepEqual(reopened.getSnapshot().value.people.hirbod, { savedPlaceIds: ['fuglen'], packedItems: ['Raincoat'] });
});

test('switching attendees keeps personal lists isolated', async () => {
  const store = createPreferencesStore(memoryStorage());
  await store.hydrate();
  await store.selectAttendee('hirbod');
  await store.togglePlace('fuglen');
  await store.selectAttendee('gabriel');
  await store.togglePlace('munch');
  await store.selectAttendee('hirbod');
  assert.deepEqual(store.getSnapshot().value.people.hirbod.savedPlaceIds, ['fuglen']);
  assert.deepEqual(store.getSnapshot().value.people.gabriel.savedPlaceIds, ['munch']);
  await store.selectAttendee('christian-falch');
  assert.equal(store.getSnapshot().value.attendeeId, 'hirbod');
});

test('slow writes are serialised and the most recent state wins', async () => {
  const disk = memoryStorage();
  let active = 0;
  const storage: PreferenceStorage = { getItem: disk.getItem, setItem: async (key, value) => {
    assert.equal(++active, 1);
    await new Promise((resolve) => setTimeout(resolve, 4));
    await disk.setItem(key, value);
    active--;
  } };
  const store = createPreferencesStore(storage);
  await store.hydrate();
  const selected = store.selectAttendee('hirbod');
  const save = store.togglePlace('fuglen');
  const remove = store.togglePlace('fuglen');
  const packed = store.togglePacking('Raincoat');
  await Promise.all([selected, save, remove, packed]);
  assert.deepEqual(parsePreferences(disk.read()).people.hirbod, { savedPlaceIds: [], packedItems: ['Raincoat'] });
});

test('failed reads preserve disk contents and can be retried', async () => {
  let fail = true, writes = 0;
  const raw = JSON.stringify({ version: 1, attendeeId: 'hirbod', people: {} });
  const store = createPreferencesStore({ getItem: async () => { if (fail) throw new Error(); return raw; }, setItem: async () => { writes++; } });
  await store.hydrate();
  assert.equal(store.getSnapshot().ready, false);
  assert(store.getSnapshot().error);
  assert.equal(writes, 0);
  fail = false;
  await store.hydrate();
  assert.equal(store.getSnapshot().value.attendeeId, 'hirbod');
});

test('failed saves remain visible and retry writes the current state', async () => {
  let fail = true;
  const disk = memoryStorage();
  const store = createPreferencesStore({ getItem: disk.getItem, setItem: async (key, value) => { if (fail) throw new Error(); assert.equal(key, PREFERENCES_KEY); await disk.setItem(key, value); } });
  await store.hydrate();
  await store.selectAttendee('hirbod');
  assert(store.getSnapshot().error);
  fail = false;
  await store.retrySave();
  assert.equal(store.getSnapshot().error, null);
  assert.equal(parsePreferences(disk.read()).attendeeId, 'hirbod');
});

test('refreshing the guide drops obsolete saved IDs and invalid attendees', () => {
  const parsed = parsePreferences(JSON.stringify({ version: 1, attendeeId: 'christian-falch', people: {
    hirbod: { savedPlaceIds: ['fuglen', 'fuglen', 'missing'], packedItems: ['Raincoat', 'removed'] },
    'christian-falch': { savedPlaceIds: ['munch'] },
  } }));
  assert.equal(parsed.attendeeId, null);
  assert.deepEqual(parsed.people.hirbod, { savedPlaceIds: ['fuglen'], packedItems: ['Raincoat'] });
  assert(!parsed.people['christian-falch']);
  assert.throws(() => parsePreferences('{invalid'));
  assert.throws(() => parsePreferences('{"version":2}'));
});
