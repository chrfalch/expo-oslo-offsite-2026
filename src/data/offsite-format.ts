import type { DeepReadonly, ScheduleEvent, TravelLeg } from './offsite-types';

/** Calendar dates must not shift when a phone uses another time zone. */
export function formatOffsiteDate(
  date: string,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' },
) {
  const value = new Date(`${date}T12:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(value.getTime()) ||
    value.toISOString().slice(0, 10) !== date) {
    throw new RangeError(`Invalid offsite calendar date: ${date}`);
  }
  return new Intl.DateTimeFormat('en-GB', { ...options, timeZone: 'UTC' }).format(value);
}

export function formatDateRange(start: string, end: string) {
  return `${formatOffsiteDate(start)} – ${formatOffsiteDate(end, {
    day: 'numeric', month: 'long', year: 'numeric',
  })}`;
}

export function formatEventTime(event: DeepReadonly<ScheduleEvent>) {
  return event.endTime ? `${event.startTime}–${event.endTime}` : `${event.startTime} · End time TBC`;
}

export function formatBookingStatus(booked: boolean | null) {
  return booked === null ? 'Booking not confirmed' : booked ? 'Booked' : 'Not booked';
}

export function formatWalkTime(minutes: number | null | undefined) {
  if (minutes == null) return 'Walking time unavailable';
  return minutes === 0 ? 'At this location' : `About ${minutes} min walk`;
}

export function formatTravelLeg(leg: DeepReadonly<TravelLeg> | null) {
  if (!leg) return 'Travel details not provided';
  return `${formatOffsiteDate(leg.date)} · ${leg.time} · ${leg.flight ?? 'Flight not provided'}`;
}
