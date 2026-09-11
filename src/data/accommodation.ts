import type { AccommodationOption, DeepReadonly } from './offsite-types';

export function orderAccommodationOptions(options: readonly DeepReadonly<AccommodationOption>[]) {
  return [...options].sort((left, right) => left.number - right.number || left.id.localeCompare(right.id));
}

export function findAccommodationForAttendee(
  options: readonly DeepReadonly<AccommodationOption>[], attendeeId: string | null | undefined,
) {
  return attendeeId ? options.find((flat) => flat.residentAttendeeIds.includes(attendeeId)) : undefined;
}

export function formatAccommodationDetails(flat: DeepReadonly<AccommodationOption>): string[] {
  const checkIn = flat.checkInFrom
    ? flat.checkInUntil ? `${flat.checkInFrom}–${flat.checkInUntil}` : `from ${flat.checkInFrom}`
    : 'Not provided';
  return [
    `${flat.maxGuests} guests maximum · ${flat.bedrooms} bedrooms · ${flat.bathrooms} ${flat.bathrooms === 1 ? 'bathroom' : 'bathrooms'}`,
    `Check-in ${checkIn} · Check-out ${flat.checkOutBy ? `by ${flat.checkOutBy}` : 'not provided'}`,
    ...(flat.selfCheckIn === true ? ['Self check-in available'] : []),
    `Hosted by ${flat.hostName}`,
    ...(flat.walkMinutesFrom.rebel != null ? [`About ${flat.walkMinutesFrom.rebel} min walk to Rebel · Estimate`] : []),
    flat.neighbourhoodNote,
    ...flat.notes,
    `Amenities · ${flat.amenities.join(', ')}`,
  ];
}
