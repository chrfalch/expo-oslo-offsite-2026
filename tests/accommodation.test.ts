import assert from 'node:assert/strict';
import { test } from 'node:test';
import { findAccommodationForAttendee, orderAccommodationOptions } from '../src/data/accommodation';
import { attendees, formatHousemates, getAccommodationResidents } from '../src/data/attendees';
import { offsiteData } from '../src/data/offsite';

test('each attendee is assigned to exactly one numbered apartment', () => {
  const apartments = orderAccommodationOptions(offsiteData.accommodation.options);
  assert.deepEqual(apartments.map((flat) => flat.number), [1, 2, 3]);
  assert.deepEqual(apartments.map((flat) => flat.name), [
    'HQ',
    'The loft',
    'Bright and light',
  ]);

  const assignedIds = apartments.flatMap((flat) => flat.residentAttendeeIds);
  assert.equal(assignedIds.length, attendees.length);
  assert.equal(new Set(assignedIds).size, attendees.length);
  assert.deepEqual(new Set(assignedIds), new Set(attendees.map((person) => person.id)));
  for (const person of attendees) {
    const flat = findAccommodationForAttendee(apartments, person.id);
    assert.ok(flat, `${person.name} has no apartment`);
    assert.ok(getAccommodationResidents(flat).some((resident) => resident.id === person.id));
  }
});

test('addresses and personalized housemate text match the confirmed assignments', () => {
  const apartments = orderAccommodationOptions(offsiteData.accommodation.options);
  assert.deepEqual(apartments.map((flat) => flat.address), [
    'Trøndergata 2, 0477 Oslo',
    'Rosenlundgata 6 A, 0474 Oslo',
    'Vogts gate 50B, 0477 Oslo',
  ]);
  assert.equal(formatHousemates(apartments[0], 'tomasz-sapeta'), 'Staying with Hirbod and Gabriel');
  assert.equal(formatHousemates(apartments[2], 'hassan-khan'), 'Staying with Jakub Tkacz');
});
