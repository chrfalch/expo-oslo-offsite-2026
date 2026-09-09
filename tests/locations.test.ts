import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getLocation, mapsUrls } from '../src/data/locations';
import { offsiteData } from '../src/data/offsite';

test('every guide place and activity resolves to its stored coordinates', () => {
  for (const place of offsiteData.places) assert.deepEqual(getLocation(`place:${place.id}`)?.coordinates, place.coordinates);
  for (const event of offsiteData.schedule) assert.deepEqual(getLocation(`activity:${event.id}`)?.coordinates, event.coordinates);
  assert.deepEqual(getLocation('workspace:rebel')?.coordinates, offsiteData.workspace.coordinates);
});

test('apartments never invent an address or pin and link to a clearly labelled area', () => {
  offsiteData.accommodation.options.forEach((flat, i) => {
    const location = getLocation(`stay:${i}`)!;
    assert.equal(location.coordinates, null);
    assert.deepEqual(mapsUrls(location, 'ios'), []);
    assert.equal(location.areaKey, 'area:torshov');
  });
  assert.match(getLocation('area:torshov')!.notice!, /not an apartment entrance/);
  assert.match(getLocation('place:grotto')!.notice!, /Approximate street/);
});

test('map handoffs use coordinates when present and encode names in native and web fallbacks', () => {
  const place = getLocation('place:fuglen')!;
  assert(mapsUrls(place, 'ios')[0].startsWith('maps://?ll=59.917498,10.740059'));
  assert.match(mapsUrls(place, 'android')[0], /^geo:59\.917498,10\.740059\?q=/);
  assert.match(mapsUrls(place, 'android')[1], /^https:\/\/www.google.com\/maps\/search/);
  const airport = getLocation('travel:Frankfurt (FRA)')!;
  assert.equal(airport.coordinates, null);
  assert(mapsUrls(airport, 'ios')[0].includes('Frankfurt%20'));
  assert.equal(mapsUrls(place, 'web').length, 1);
  assert.equal(getLocation('travel:unknown'), undefined);
  assert.equal(getLocation('place:unknown'), undefined);
  assert.equal(getLocation('stay:-1'), undefined);
});
