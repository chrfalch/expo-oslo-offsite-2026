import { useState } from 'react';
import { formatBookingStatus, formatDateRange, formatEventTime, formatOffsiteDate, getSchedule, offsiteData } from '@/data/offsite';
import { getDefaultScheduleDay } from '@/data/offsite-time';
import { ContentPageView } from '@/presentation/content-page-view';
import { useOffsiteNavigation } from '@/screens/navigation';

export default function ScheduleScreen() {
  const [day, setDay] = useState(() => getDefaultScheduleDay(new Date(), offsiteData.event));
  const { location, activity, router } = useOffsiteNavigation();
  const { event } = offsiteData;
  const dates = [];
  for (let date = new Date(`${event.startDate}T12:00:00Z`); date.toISOString().slice(0, 10) <= event.endDate; date.setUTCDate(date.getUTCDate() + 1)) dates.push(date.toISOString().slice(0, 10));
  return <ContentPageView intro={`${formatDateRange(event.startDate, event.endDate)} · Times in Oslo`}
    choices={[{ id: 'schedule-day', label: 'Day', value: day, onChange: setDay, options: [{ value: 'all', label: 'All days' },
      ...dates.map((value) => ({ value, label: formatOffsiteDate(value, { weekday: 'short', day: 'numeric', month: 'short' }) }))] }]}
    sections={[
      ...(day === 'all' ? dates : [day]).map((date) => {
        const working = date >= event.workingDays.startDate && date <= event.workingDays.endDate;
        const events = getSchedule(date);
        return { id: date, title: formatOffsiteDate(date, { weekday: 'long', day: 'numeric', month: 'short' }),
          description: !working && !events.length ? 'No shared activities planned.' : undefined,
          rows: [
            ...(working ? [{ id: `work-${date}`, title: event.workingDays.hours, detail: 'SDK focus · Rebel', testID: `schedule-workspace-${date}`, onPress: () => location('workspace:rebel') }] : []),
            ...events.map((item) => ({ id: item.id, title: `${formatEventTime(item)} · ${item.title}`,
              detail: `${item.location} · ${formatBookingStatus(item.booked)}`, testID: `activity-${item.id}`, onPress: () => activity(item.id) })),
          ],
        };
      }),
      { id: 'work-note', description: event.workingDays.note },
      { id: 'team-travel', rows: [{ id: 'team-travel', title: 'Team arrivals & departures', detail: 'Includes travel before the offsite starts', onPress: () => router.push({ pathname: '/travel', params: { mode: 'all' } }) }] },
    ]} />;
}
