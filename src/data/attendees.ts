import { offsiteData } from './offsite';

export function attendeeId(name: string) {
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/ł/g, 'l').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** Identity is a local convenience, not authentication. Keep the source guide intact. */
export const attendees = offsiteData.travel
  .filter((person) => attendeeId(person.name) !== 'christian-falch')
  .map((person) => ({ ...person, id: attendeeId(person.name) }));

export const getAttendee = (id: string | null) => attendees.find((person) => person.id === id);
