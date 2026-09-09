import type { DeepReadonly, OffsiteData, Traveler } from './offsite-types';

export function getOffsiteMoment(now: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  return {
    date: ['year', 'month', 'day'].map((type) => parts.find((part) => part.type === type)?.value).join('-'),
    time: new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now),
  };
}

export function getDefaultScheduleDay(now: Date, event: DeepReadonly<OffsiteData['event']>) {
  const { date } = getOffsiteMoment(now, event.timezone);
  return date >= event.startDate && date <= event.endDate ? date : 'all';
}

export function getUpcomingTravel(person: DeepReadonly<Traveler> | undefined, moment: ReturnType<typeof getOffsiteMoment>) {
  return (['arrival', 'departure'] as const).find((direction) => {
    const leg = person?.[direction];
    return leg && `${leg.date} ${leg.time}` >= `${moment.date} ${moment.time}`;
  });
}
