import { attendees, getAttendee } from '../data/attendees';
import { offsiteData } from '../data/offsite';

export type PersonalPreferences = { savedPlaceIds: readonly string[]; packedItems: readonly string[] };
export type Preferences = { version: 1; attendeeId: string | null; people: Record<string, PersonalPreferences> };
export type PreferencesSnapshot = { ready: boolean; value: Preferences; error: string | null; saving: boolean };
export interface PreferenceStorage { getItem(key: string): Promise<string | null>; setItem(key: string, value: string): Promise<unknown> }
export const PREFERENCES_KEY = '@oslo-offsite/preferences/v1';
export const emptyPersonal: PersonalPreferences = { savedPlaceIds: [], packedItems: [] };
const empty = (): Preferences => ({ version: 1, attendeeId: null, people: {} });

export function parsePreferences(raw: string | null): Preferences {
  if (raw === null) return empty();
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object' || !('version' in parsed) || parsed.version !== 1) throw new Error('Unrecognised preferences');
  const value = parsed as Record<string, unknown>;
  const people: Preferences['people'] = {};
  const knownPlaces = new Set(offsiteData.places.map((place) => place.id));
  const knownPacking = new Set(offsiteData.packing.map((item) => item.item));
  const storedPeople = value.people && typeof value.people === 'object' ? value.people as Record<string, unknown> : {};
  const valid = (items: unknown, allowed: Set<string>) => Array.isArray(items)
    ? [...new Set(items.filter((item): item is string => typeof item === 'string' && allowed.has(item)))] : [];
  for (const attendee of attendees) {
    const saved = storedPeople[attendee.id];
    if (saved && typeof saved === 'object') {
      const p = saved as Record<string, unknown>;
      people[attendee.id] = { savedPlaceIds: valid(p.savedPlaceIds, knownPlaces), packedItems: valid(p.packedItems, knownPacking) };
    }
  }
  return { version: 1, attendeeId: typeof value.attendeeId === 'string' && getAttendee(value.attendeeId) ? value.attendeeId : null, people };
}

/** Serialise disk writes so rapid changes cannot restore an older snapshot. */
export function createPreferencesStore(storage: PreferenceStorage) {
  let snapshot: PreferencesSnapshot = { ready: false, value: empty(), error: null, saving: false };
  const listeners = new Set<() => void>();
  let loading: Promise<void> | undefined;
  let writes: Promise<void> = Promise.resolve();
  let revision = 0;
  const publish = (update: Partial<PreferencesSnapshot>) => {
    snapshot = { ...snapshot, ...update };
    listeners.forEach((listener) => listener());
  };
  const persist = (value: Preferences) => {
    const current = ++revision;
    publish({ value, saving: true, error: null });
    writes = writes.then(async () => {
      try {
        await storage.setItem(PREFERENCES_KEY, JSON.stringify(value));
        if (current === revision) publish({ saving: false, error: null });
      } catch {
        if (current === revision) publish({ saving: false, error: 'Your changes could not be saved on this phone. Please try again.' });
      }
    });
    return writes;
  };
  const updatePersonal = (transform: (p: PersonalPreferences) => PersonalPreferences) => {
    const value = snapshot.value, id = value.attendeeId;
    if (!snapshot.ready || !id) return Promise.resolve();
    return persist({ ...value, people: { ...value.people, [id]: transform(value.people[id] ?? emptyPersonal) } });
  };
  const toggle = (values: readonly string[], value: string) => values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    hydrate() {
      if (snapshot.ready) return Promise.resolve();
      if (loading) return loading;
      publish({ error: null });
      loading = storage.getItem(PREFERENCES_KEY).then((raw) => {
        publish({ value: parsePreferences(raw), ready: true, error: null });
      }).catch(() => {
        publish({ error: 'Your saved guide could not be loaded. Please try again.' });
      }).finally(() => { loading = undefined; });
      return loading;
    },
    selectAttendee(id: string) {
      if (!snapshot.ready || !getAttendee(id)) return Promise.resolve();
      return persist({ ...snapshot.value, attendeeId: id });
    },
    togglePlace(id: string) {
      if (!offsiteData.places.some((place) => place.id === id)) return Promise.resolve();
      return updatePersonal((p) => ({ ...p, savedPlaceIds: toggle(p.savedPlaceIds, id) }));
    },
    togglePacking(item: string) {
      if (!offsiteData.packing.some((p) => p.item === item)) return Promise.resolve();
      return updatePersonal((p) => ({ ...p, packedItems: toggle(p.packedItems, item) }));
    },
    retrySave: () => persist(snapshot.value),
  };
}
