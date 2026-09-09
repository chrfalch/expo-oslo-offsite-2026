import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatLocationAccuracy, getLocation, isApproximateLocation, mapsUrls } from '../src/data/locations';
import { offsiteData } from '../src/data/offsite';
import type { AccommodationOption } from '../src/data/offsite';

const stayLocation = (overrides: Partial<AccommodationOption>) => getLocation('stay:0', {
  ...offsiteData,
  accommodation: { ...offsiteData.accommodation, options: [{
    ...offsiteData.accommodation.options[0], address: null, coordinates: null, photos: [], ...overrides,
  }] },
})!;

test('every guide place and activity resolves to its stored coordinates', () => {
  for (const place of offsiteData.places) assert.deepEqual(getLocation(`place:${place.id}`)?.coordinates, place.coordinates);
  for (const event of offsiteData.schedule) assert.deepEqual(getLocation(`activity:${event.id}`)?.coordinates, event.coordinates);
  assert.deepEqual(getLocation('workspace:rebel')?.coordinates, offsiteData.workspace.coordinates);
});

test('place, activity and workspace locations retain images, descriptions and website links', () => {
  for (const place of offsiteData.places) {
    const location = getLocation(`place:${place.id}`)!;
    assert.equal(location.address, place.address);
    assert.deepEqual(location.image, place.image);
    assert.equal(location.description, place.description);
    assert.equal(location.websiteUrl, place.url ?? undefined);
    assert.notEqual(location.websiteLabel, 'View Airbnb');
  }
  for (const event of offsiteData.schedule) {
    const location = getLocation(`activity:${event.id}`)!;
    assert.equal(location.address, event.address);
    assert.deepEqual(location.image, event.image);
    assert.equal(location.description, event.notes);
  }
  const workspace = getLocation('workspace:rebel')!;
  assert.deepEqual(workspace.image, offsiteData.workspace.image);
  assert.equal(workspace.description, offsiteData.workspace.notes);
  assert.equal(workspace.websiteUrl, offsiteData.workspace.url);
  const placeWithoutImage = { ...offsiteData.places[0], image: null };
  const location = getLocation(`place:${placeWithoutImage.id}`, { ...offsiteData, places: [placeWithoutImage] })!;
  assert.equal(location.image, null);
  assert.equal(location.address, placeWithoutImage.address);
  assert.deepEqual(location.coordinates, placeWithoutImage.coordinates);
});

test('an apartment with no location never invents an address or pin', () => {
  const location = stayLocation({});
  assert.equal(location.address, null);
  assert.equal(location.coordinates, null);
  for (const platform of ['ios', 'android', 'web'] as const) assert.deepEqual(mapsUrls(location, platform), []);
  assert.equal(location.areaKey, 'area:torshov');
  assert.match(location.notice!, /address is not provided/);
  assert.match(getLocation('area:torshov')!.notice!, /not an apartment entrance/);
  assert.match(getLocation('place:grotto')!.notice!, /Approximate street/);
});

test('every apartment exposes its saved address, photos, listing and coordinates', () => {
  offsiteData.accommodation.options.forEach((flat, index) => {
    const location = getLocation(`stay:${index}`)!;
    assert.equal(location.title, flat.name);
    assert.equal(location.address, flat.address);
    assert.deepEqual(location.coordinates, flat.coordinates);
    assert.deepEqual(location.photos, flat.photos);
    assert.equal(location.websiteUrl, flat.url);
  });
});

test('a confirmed apartment address with no coordinates searches Maps for the address', () => {
  const location = stayLocation({ address: 'Vogts gate 45A' });
  assert.equal(location.coordinates, null);
  assert.equal(location.areaKey, undefined);
  assert.match(location.notice!, /address is confirmed/);
  const query = encodeURIComponent('Vogts gate 45A, Oslo, Norway');
  assert.equal(mapsUrls(location, 'ios')[0], `maps://?q=${query}`);
  assert.equal(mapsUrls(location, 'android')[0], `geo:0,0?q=${query}`);
  assert.equal(mapsUrls(location, 'web')[0], `https://www.google.com/maps/search/?api=1&query=${query}`);
});

test('confirmed apartment pins take precedence over address search without an area fallback', () => {
  const coordinates = { lat: 59.933992, lng: 10.764322, precision: 'address', source: 'geonorge', matchedAddress: 'Vogts gate 45A' };
  const photos = [{ file: 'assets/accommodation/flat.jpg', sourceUrl: 'https://example.com/flat.jpg', caption: 'Living room' }];
  const location = stayLocation({ address: 'Vogts gate 45A', coordinates, photos });
  assert.equal(location.notice, undefined);
  assert.equal(location.areaKey, undefined);
  assert.deepEqual(location.photos, photos);
  assert.match(mapsUrls(location, 'ios')[0], /^maps:\/\/\?ll=59\.933992,10\.764322/);
  assert.match(mapsUrls(location, 'android')[0], /^geo:59\.933992,10\.764322/);
  assert.match(mapsUrls(location, 'web')[0], /query=59\.933992%2C10\.764322/);
});

test('Airbnb pins are approximate and never presented as confirmed addresses or Kartverket data', () => {
  for (const flat of offsiteData.accommodation.options) {
    const location = getLocation(`stay:${flat.id}`)!;
    assert.equal(location.address, null);
    assert.equal(location.coordinates?.matchedAddress, null);
    assert.equal(location.coordinates?.precision, 'approximate');
    assert.equal(isApproximateLocation(location), true);
    assert.equal(location.areaKey, undefined);
    assert.match(location.notice!, /100-200 m/);
    assert.match(location.notice!, /not an apartment entrance/);
    assert.match(formatLocationAccuracy(location)!, /Approximate area location · Source: Airbnb listing/);
    assert.doesNotMatch(formatLocationAccuracy(location)!, /Address-level|Kartverket/);
    assert.match(mapsUrls(location, 'ios')[0], /approximate/);
    assert.match(mapsUrls(location, 'android')[0], /approximate/);
  }
  assert.equal(isApproximateLocation(getLocation('workspace:rebel')!), false);
  assert.match(formatLocationAccuracy(getLocation('workspace:rebel')!)!, /Address-level location · Source: Kartverket/);
  assert.equal(formatLocationAccuracy(stayLocation({})), undefined);
});

test('apartment IDs remain stable when the listing order changes; numeric links still work', () => {
  const flat = offsiteData.accommodation.options[0];
  const reordered = { ...offsiteData, accommodation: {
    ...offsiteData.accommodation, options: [...offsiteData.accommodation.options].reverse(),
  } };
  assert.equal(getLocation(`stay:${flat.id}`, reordered)?.title, flat.name);
  assert.equal(getLocation('stay:0')?.title, flat.name);
});

test('street-level apartment coordinates remain explicitly approximate', () => {
  const location = stayLocation({ coordinates: {
    lat: 59.933992, lng: 10.764322, precision: 'street', source: 'geonorge', matchedAddress: 'Vogts gate',
  } });
  assert.match(location.notice!, /Approximate street location, not a confirmed entrance/);
  assert.equal(location.address, null);
  assert.equal(location.areaKey, undefined);
  assert.equal(mapsUrls(location, 'web').length, 1);
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
  assert.equal(getLocation('stay:999'), undefined);
  assert.equal(getLocation('stay:1.5'), undefined);
  assert.equal(getLocation('stay:unknown'), undefined);
});
