import { useState } from 'react';

import {
  formatBookingStatus, formatDateRange, formatEventTime, formatOffsiteDate, formatTravelLeg,
  getSchedule, getTravel, offsite, type TravelDirection,
} from '@/data/offsite';
import { ScheduleView } from '@/presentation/schedule-view';

export default function ScheduleScreen() {
  const [direction, setDirection] = useState<TravelDirection>('arrival');
  return (
    <ScheduleView
      dateRange={formatDateRange(offsite.startDate, offsite.endDate)}
      working={{
        id: 'working', eyebrow: 'WORKING TOGETHER',
        title: formatDateRange(offsite.workingDays.startDate, offsite.workingDays.endDate),
        description: [offsite.workingDays.hours, offsite.workingDays.note].join('\n'),
      }}
      events={getSchedule().map((event) => ({
        id: event.id,
        eyebrow: formatOffsiteDate(event.date, { weekday: 'long', day: 'numeric', month: 'long' }),
        title: event.title,
        description: [formatEventTime(event), event.location, event.address,
          formatBookingStatus(event.booked), event.notes].filter(Boolean).join('\n'),
      }))}
      timeZoneNote={`Schedule and Oslo arrival/departure times use ${offsite.timeZone}.`}
      direction={direction}
      onDirectionChange={(value) => { if (value === 'arrival' || value === 'departure') setDirection(value); }}
      travelers={getTravel(direction).map((person) => ({
        id: person.name,
        eyebrow: person.role === 'organizer' ? 'ORGANIZER' : undefined,
        title: person.name,
        description: [formatTravelLeg(person.details), person.details?.note].filter(Boolean).join('\n'),
      }))}
    />
  );
}
