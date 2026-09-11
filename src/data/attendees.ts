import { offsiteData } from './offsite';
import type { AccommodationOption, DeepReadonly } from './offsite-types';

export function attendeeId(name: string) {
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/ł/g, 'l').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** Identity is a local convenience, not authentication. Keep the source guide intact. */
export const attendees = offsiteData.travel
  .filter((person) => attendeeId(person.name) !== 'christian-falch')
  .map((person) => ({ ...person, id: attendeeId(person.name) }));

export const getAttendee = (id: string | null) => attendees.find((person) => person.id === id);

export const getAccommodationResidents = (flat: DeepReadonly<AccommodationOption>) =>
  flat.residentAttendeeIds.map((id) => getAttendee(id)).filter((person): person is NonNullable<typeof person> => !!person);

function joinNames(names: string[]) {
  if (names.length < 2) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;
}

export function formatHousemates(flat: DeepReadonly<AccommodationOption>, attendeeId: string) {
  const names = getAccommodationResidents(flat).filter((person) => person.id !== attendeeId).map((person) => person.name);
  return names.length ? `Staying with ${joinNames(names)}` : 'Your apartment';
}
