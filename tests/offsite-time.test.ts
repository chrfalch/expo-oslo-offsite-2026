import assert from 'node:assert/strict';
import { test } from 'node:test';
import { offsiteData } from '../src/data/offsite';
import { getDefaultScheduleDay, getOffsiteMoment, getUpcomingTravel } from '../src/data/offsite-time';

test('schedule opens on the Oslo calendar day during the offsite, including midnight abroad', () => {
  assert.equal(getDefaultScheduleDay(new Date('2026-09-14T22:15:00Z'), offsiteData.event), '2026-09-15');
  assert.equal(getDefaultScheduleDay(new Date('2026-09-12T22:00:00Z'), offsiteData.event), '2026-09-13');
  assert.equal(getDefaultScheduleDay(new Date('2026-09-19T21:59:00Z'), offsiteData.event), '2026-09-19');
  assert.equal(getDefaultScheduleDay(new Date('2026-09-19T22:00:00Z'), offsiteData.event), 'all');
  assert.equal(getDefaultScheduleDay(new Date('2026-09-09T10:00:00Z'), offsiteData.event), 'all');
});

test('Oslo clock uses local time through the daylight-saving boundary', () => {
  assert.deepEqual(getOffsiteMoment(new Date('2026-09-14T22:15:00Z'), 'Europe/Oslo'), { date: '2026-09-15', time: '00:15' });
  assert.deepEqual(getOffsiteMoment(new Date('2026-10-25T01:15:00Z'), 'Europe/Oslo'), { date: '2026-10-25', time: '02:15' });
});

test('home travel advances from arrival to departure, then to the complete trip', () => {
  const person = { name: 'Test attendee', role: 'attendee',
    arrival: { date: '2026-09-13', time: '14:00', flight: null },
    departure: { date: '2026-09-19', time: '10:00', flight: null } };
  assert.equal(getUpcomingTravel(person, { date: '2026-09-13', time: '13:59' }), 'arrival');
  assert.equal(getUpcomingTravel(person, { date: '2026-09-13', time: '14:01' }), 'departure');
  assert.equal(getUpcomingTravel(person, { date: '2026-09-19', time: '10:01' }), undefined);
  assert.equal(getUpcomingTravel({ ...person, arrival: null }, { date: '2026-09-13', time: '13:59' }), 'departure');
  assert.equal(getUpcomingTravel(undefined, { date: '2026-09-13', time: '13:59' }), undefined);
});
