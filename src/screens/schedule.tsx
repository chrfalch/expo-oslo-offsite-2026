import { useState } from 'react';
import { formatBookingStatus, formatDateRange, formatEventTime, formatOffsiteDate, getSchedule, offsiteData } from '@/data/offsite';
import { ContentPageView } from '@/presentation/content-page-view';
import { useOffsiteNavigation } from '@/screens/navigation';

export default function ScheduleScreen() {
  const [day, setDay] = useState('all');
  const { location, activity, router } = useOffsiteNavigation();
  const { event } = offsiteData;
  const dates = [];
  for (let date = new Date(`${event.startDate}T12:00:00Z`); date.toISOString().slice(0, 10) <= event.endDate; date.setUTCDate(date.getUTCDate() + 1)) dates.push(date.toISOString().slice(0, 10));
  const working = day === 'all' || (day >= event.workingDays.startDate && day <= event.workingDays.endDate);
  const events = getSchedule(day === 'all' ? undefined : day);
  return <ContentPageView intro={`${formatDateRange(event.startDate, event.endDate)} · Times in Oslo`}
    choices={[{ id: 'schedule-day', label: 'Day', value: day, onChange: setDay, options: [{ value: 'all', label: 'All days' },
      ...dates.map((value) => ({ value, label: formatOffsiteDate(value, { weekday: 'short', day: 'numeric', month: 'short' }) }))] }]}
    sections={[
      ...(working ? [{ id: 'work', cards: [{ id: 'work', title: 'SDK focus at Rebel', eyebrow: day === 'all' ? formatDateRange(event.workingDays.startDate, event.workingDays.endDate).toUpperCase() : 'WORKING DAY',
        description: `${event.workingDays.hours}\n${event.workingDays.note}`, actions: [{ label: 'Rebel · Show on map', onPress: () => location('workspace:rebel'), testID: 'schedule-workspace' }] }] }] : []),
      { id: 'shared-activities', title: 'Shared activities', description: events.length ? undefined : 'No shared activities listed for this day.',
        cards: events.map((item) => ({ id: item.id, title: item.title, eyebrow: `${formatOffsiteDate(item.date)} · ${formatEventTime(item)}`,
          description: formatBookingStatus(item.booked), actions: [
            { label: 'View activity', onPress: () => activity(item.id), testID: `activity-${item.id}`, primary: true },
            { label: `${item.location} · Map`, onPress: () => location(`activity:${item.id}`) },
          ] })) },
      { id: 'team-travel', rows: [{ id: 'team-travel', title: 'Team arrivals & departures', detail: 'Includes travel before the offsite starts', onPress: () => router.push({ pathname: '/travel', params: { mode: 'all' } }) }] },
    ]} />;
}
