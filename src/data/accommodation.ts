import type { AccommodationOption, DeepReadonly } from './offsite-types';

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
