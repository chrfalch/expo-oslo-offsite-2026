import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
  formatAccommodationDetails, formatBookingStatus, formatDateRange, formatEventTime, formatOffsiteDate, formatTravelLeg,
  formatWalkTime, getFoodPlaces, getPlace, getPlaces, getSchedule, getScheduleDays, getTravel,
  offsite, offsiteData, placeCategoryLabels,
} from '../src/data/offsite';
import { createOffsiteGuide } from '../src/data/offsite-guide';
import type { DeepReadonly, Place } from '../src/data/offsite-types';

const withPlaces = (places: readonly DeepReadonly<Place>[]) =>
  createOffsiteGuide({ ...offsiteData, places });

describe('bundled data integrity', () => {
  test('keeps the existing metadata API in sync with the JSON', () => {
    assert.equal(offsite.name, offsiteData.event.name);
    assert.equal(offsite.month, 'September 2026');
    assert.equal(offsite.location, 'Oslo, Norway');
    assert.equal(offsite.timeZone, offsiteData.event.timezone);
  });

  test('has unique entity IDs and supported categories', () => {
    for (const records of [offsiteData.places, offsiteData.schedule, offsiteData.foodToTry.fromSupermarket, offsiteData.foodToTry.outAndAbout, offsiteData.expoCustomerApps]) {
      assert.equal(new Set(records.map((record) => record.id)).size, records.length);
      assert.ok(records.every((record) => record.id.length > 0));
    }
    for (const place of offsiteData.places) {
      assert.ok(Object.hasOwn(placeCategoryLabels, place.category), place.id);
    }
  });

  test('resolves every food-to-place reference', () => {
    for (const food of offsiteData.foodToTry.outAndAbout) {
      assert.deepEqual(getFoodPlaces(food).map((place) => place.id), food.placeIds, food.name);
    }
  });

  test('accommodation photos have bundled paths, HTTPS provenance and captions', () => {
    for (const flat of offsiteData.accommodation.options) {
      assert.ok(Array.isArray(flat.photos), flat.name);
      assert.equal(new Set(flat.photos.map((photo) => photo.file)).size, flat.photos.length, flat.name);
      for (const photo of flat.photos) {
        assert.match(photo.file, new RegExp(`^assets/accommodation/${flat.id}-\\d+\\.jpg$`));
        const url = new URL(photo.sourceUrl);
        assert.equal(url.protocol, 'https:', flat.name);
        assert.equal(url.username, '');
        assert.equal(url.password, '');
        assert.ok(photo.caption?.trim().length, flat.name);
        assert.ok(!/x-amz-signature|x-amz-expires|x-goog-signature/i.test(url.search), 'Avoid expiring photo links');
      }
      if (flat.address !== null) assert.ok(flat.address.trim().length > 0, flat.name);
    }
  });

  test('accommodation totals, check-in times and descriptive details match the updated listings', () => {
    const { accommodation: a } = offsiteData;
    assert.equal(new Set(a.options.map((flat) => flat.id)).size, a.options.length);
    assert.equal(a.totalMaxGuests, a.options.reduce((total, flat) => total + flat.maxGuests, 0));
    assert.equal(a.totalBedrooms, a.options.reduce((total, flat) => total + flat.bedrooms, 0));
    assert.deepEqual(a.options.map((flat) => flat.photos.length), [3, 4, 4]);
    for (const flat of a.options) {
      assert.ok(flat.description.length > 0);
      for (const time of [flat.checkInFrom, flat.checkInUntil, flat.checkOutBy]) {
        if (time) assert.match(time, /^([01]\d|2[0-3]):[0-5]\d$/);
      }
    }
    const bright = formatAccommodationDetails(a.options[0]);
    assert.ok(bright.includes('Check-in from 15:00 · Check-out by 13:00'));
    assert.ok(bright.includes('Self check-in available'));
    const top = formatAccommodationDetails(a.options[1]);
    assert.ok(top.includes('Check-in 12:00–21:00 · Check-out by 12:00'));
    assert.ok(top.includes('6 guests maximum · 3 bedrooms · 1.5 bathrooms'));
    assert.ok(!top.includes('Self check-in available'));
    const unknown = formatAccommodationDetails({ ...a.options[0], checkInFrom: null, checkInUntil: null, checkOutBy: null, walkMinutesFrom: { rebel: null } });
    assert.ok(unknown.includes('Check-in Not provided · Check-out not provided'));
    assert.ok(!unknown.some((detail) => detail.includes('walk to Rebel')));
  });

  test('has valid coordinates and non-negative estimates with known base IDs', () => {
    const coordinates = [
      ...offsiteData.places.map((place) => place.coordinates),
      ...offsiteData.schedule.map((event) => event.coordinates),
      ...Object.values(offsiteData.referencePoints).map((base) => base.coordinates),
      ...offsiteData.accommodation.options.map((flat) => flat.coordinates),
      offsiteData.workspace.coordinates,
    ];
    for (const point of coordinates) {
      if (!point) continue;
      assert.ok(Number.isFinite(point.lat) && Math.abs(point.lat) <= 90);
      assert.ok(Number.isFinite(point.lng) && Math.abs(point.lng) <= 180);
      assert.ok(offsiteData.geo.precisionValues.includes(point.precision));
    }
    for (const place of offsiteData.places) {
      for (const estimates of [place.walkMinutesFrom, place.distanceMetersFrom]) {
        for (const [base, value] of Object.entries(estimates)) {
          assert.ok(Object.hasOwn(offsiteData.referencePoints, base), `${place.id}: ${base}`);
          if (value !== null) assert.ok(Number.isFinite(value) && value >= 0, place.id);
        }
      }
    }
  });

  test('has valid event and travel calendar dates and local times', () => {
    const isTime = (value: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
    const event = offsiteData.event;
    assert.doesNotThrow(() => formatDateRange(event.startDate, event.endDate));
    assert.ok(event.startDate <= event.endDate);
    assert.ok(event.workingDays.startDate >= event.startDate);
    assert.ok(event.workingDays.endDate <= event.endDate);
    for (const session of offsiteData.schedule) {
      assert.doesNotThrow(() => formatOffsiteDate(session.date));
      assert.ok(session.date >= event.startDate && session.date <= event.endDate);
      assert.ok(isTime(session.startTime));
      if (session.endTime) assert.ok(isTime(session.endTime));
      assert.ok(session.booked === null || typeof session.booked === 'boolean');
    }
    for (const person of offsiteData.travel) {
      for (const leg of [person.arrival, person.departure]) {
        if (!leg) continue;
        assert.doesNotThrow(() => formatOffsiteDate(leg.date));
        assert.ok(isTime(leg.time), person.name);
      }
    }
  });

  test('protects the shared snapshot from nested mutation', () => {
    assert.ok(Object.isFrozen(offsiteData));
    assert.ok(Object.isFrozen(offsiteData.places));
    assert.ok(Object.isFrozen(offsiteData.places[0].coordinates));
    assert.ok(Object.isFrozen(offsiteData.packing[0].notes));
    assert.throws(() => Object.assign(offsiteData.places[0], { name: 'Changed' }), TypeError);
  });
});

describe('place discovery', () => {
  test('looks up IDs and returns undefined for a missing place', () => {
    assert.equal(getPlace('fuglen')?.name, 'Fuglen');
    assert.equal(getPlace('missing'), undefined);
  });

  test('combines category, search and a walking-time limit', () => {
    const result = getPlaces({ category: 'lunch', query: 'pizza', near: 'rebel', maxWalkMinutes: 0 });
    assert.deepEqual(result.map((place) => place.id), ['stykke-pizza']);
  });

  test('matches Norwegian names without accents and ignores casing and whitespace', () => {
    assert.deepEqual(getPlaces({ query: '  APENT  BAKERI ' }).map((place) => place.id),
      ['apent-bakeri-torshov']);
    assert.deepEqual(getPlaces({ query: 'godt brod' }).map((place) => place.id), ['godt-brod']);
    assert.ok(getPlaces({ query: 'grunerlokka' }).length > 0);
  });

  test('searches dishes and addresses as well as names', () => {
    assert.deepEqual(getPlaces({ query: 'oslohoma' }).map((place) => place.id), ['render']);
    assert.ok(getPlaces({ query: 'universitetsgata 2' }).some((place) => place.id === 'fuglen'));
  });

  test('returns all places for blank search and an empty list for no matches', () => {
    assert.equal(getPlaces({ query: '   ' }).length, offsiteData.places.length);
    assert.deepEqual(getPlaces({ query: 'no-such-place-123' }), []);
  });

  test('sorts by the requested base without changing the source order', () => {
    const ids = offsiteData.places.map((place) => place.id);
    for (const near of ['rebel', 'torshov'] as const) {
      const results = getPlaces({ near });
      assert.ok(results.every((place, index) => index === 0 ||
        (results[index - 1].walkMinutesFrom[near] ?? Infinity) <=
        (place.walkMinutesFrom[near] ?? Infinity)));
    }
    assert.deepEqual(offsiteData.places.map((place) => place.id), ids);
  });

  test('keeps zero-minute walks, sorts unknown times last and breaks ties by name', () => {
    const base = offsiteData.places[0];
    const guide = withPlaces([
      { ...base, id: 'null', name: 'A unknown', walkMinutesFrom: { rebel: null } },
      { ...base, id: 'missing', name: 'B unknown', walkMinutesFrom: {} },
      { ...base, id: 'z', name: 'Z cafe', walkMinutesFrom: { rebel: 5 } },
      { ...base, id: 'a', name: 'A cafe', walkMinutesFrom: { rebel: 5 } },
      { ...base, id: 'zero', walkMinutesFrom: { rebel: 0 } },
    ]);
    assert.deepEqual(guide.getPlaces({ near: 'rebel' }).map((place) => place.id),
      ['zero', 'a', 'z', 'null', 'missing']);
    assert.deepEqual(guide.getPlaces({ near: 'rebel', maxWalkMinutes: 5 }).map((place) => place.id),
      ['zero', 'a', 'z']);
  });

  test('rejects an ambiguous or invalid walking-time filter', () => {
    assert.throws(() => getPlaces({ maxWalkMinutes: 10 }), RangeError);
    for (const maxWalkMinutes of [-1, NaN, Infinity]) {
      assert.throws(() => getPlaces({ near: 'rebel', maxWalkMinutes }), RangeError);
    }
  });

  test('tolerates missing optional place details while searching', () => {
    const guide = withPlaces([{
      ...offsiteData.places[0], cuisine: null, area: null, address: null,
      signatureDish: null, coordinates: null,
    }]);
    assert.equal(guide.getPlaces({ query: 'pizza' }).length, 1);
  });

  test('returns independent result arrays', () => {
    const result = getPlaces();
    result.pop();
    assert.equal(getPlaces().length, offsiteData.places.length);
  });
});

describe('schedule and travel', () => {
  test('sorts schedule events by day and time and groups days', () => {
    const base = offsiteData.schedule[0];
    const guide = createOffsiteGuide({ ...offsiteData, schedule: [
      { ...base, id: 'late', date: '2026-09-16', startTime: '18:00' },
      { ...base, id: 'early', date: '2026-09-15', startTime: '09:00' },
      { ...base, id: 'middle', date: '2026-09-15', startTime: '12:00' },
    ] });
    assert.deepEqual(guide.getSchedule().map((event) => event.id), ['early', 'middle', 'late']);
    assert.deepEqual(guide.getScheduleDays().map((day) => day.events.length), [2, 1]);
  });

  test('filters an exact calendar date without inventing work sessions', () => {
    assert.deepEqual(getSchedule('2026-09-15').map((event) => event.id), ['sauna']);
    assert.deepEqual(getSchedule('2026-09-14'), []);
    assert.equal(getScheduleDays().flatMap((day) => day.events).length, offsiteData.schedule.length);
  });

  test('orders arrivals chronologically and retains unknown travel last', () => {
    const arrivals = getTravel();
    assert.equal(arrivals[0].name, 'Tomasz Sapeta');
    assert.equal(arrivals.at(-1)?.name, 'Christian Falch');
    assert.equal(arrivals.at(-1)?.details, null);
    assert.equal(arrivals.length, offsiteData.travel.length);
  });

  test('uses Hirbod’s landing date rather than the previous departure date', () => {
    assert.deepEqual(getTravel('arrival', '2026-09-14').map((person) => person.name), ['Hirbod']);
    assert.deepEqual(getTravel('arrival', '2026-09-13'), []);
    const arrival = getTravel('arrival', '2026-09-14')[0].details;
    assert.equal(arrival?.time, '00:05');
    assert.equal(arrival?.departureDate, '2026-09-13');
  });

  test('filters departures independently and preserves missing flight numbers', () => {
    const departures = getTravel('departure', '2026-09-18');
    assert.deepEqual(departures.map((person) => person.name), ['Jakub Tkacz', 'Gabriel']);
    assert.equal(departures[1].details?.flight, null);
  });

  test('handles empty content and stale food references without throwing', () => {
    const guide = createOffsiteGuide({ ...offsiteData, places: [], schedule: [], travel: [] });
    assert.deepEqual(guide.getScheduleDays(), []);
    assert.deepEqual(guide.getTravel(), []);
    assert.deepEqual(guide.getFoodPlaces({ id: 'food', name: 'Food', description: '', placeIds: ['missing'] }), []);
  });
});

describe('display formatting', () => {
  test('formats calendar dates independently of the device time zone', () => {
    const original = process.env.TZ;
    try {
      for (const zone of ['America/Los_Angeles', 'Pacific/Kiritimati', 'Europe/Oslo']) {
        process.env.TZ = zone;
        assert.equal(formatOffsiteDate('2026-09-14'), '14 September');
      }
    } finally {
      if (original === undefined) delete process.env.TZ;
      else process.env.TZ = original;
    }
  });

  test('rejects invalid calendar dates', () => {
    for (const date of ['2026-02-30', '2026-13-01', 'invalid', '2026-9-1']) {
      assert.throws(() => formatOffsiteDate(date), RangeError);
    }
  });

  test('distinguishes unknown bookings from false and unknown walks from zero', () => {
    assert.equal(formatBookingStatus(null), 'Booking not confirmed');
    assert.equal(formatBookingStatus(false), 'Not booked');
    assert.equal(formatBookingStatus(true), 'Booked');
    assert.equal(formatWalkTime(0), 'At this location');
    assert.equal(formatWalkTime(null), 'Walking time unavailable');
    assert.equal(formatWalkTime(undefined), 'Walking time unavailable');
    assert.equal(formatWalkTime(12), 'About 12 min walk');
  });

  test('preserves local times and explicitly handles unknown end times and flights', () => {
    assert.equal(formatEventTime(getSchedule('2026-09-15')[0]), '18:45–20:45');
    assert.equal(formatEventTime(getSchedule('2026-09-17')[0]), '18:00 · End time TBC');
    assert.equal(formatTravelLeg(null), 'Travel details not provided');
    assert.equal(formatTravelLeg({ date: '2026-09-18', time: '21:30', flight: null }),
      '18 September · 21:30 · Flight not provided');
  });
});
