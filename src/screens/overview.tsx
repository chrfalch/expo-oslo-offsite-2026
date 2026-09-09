import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { formatOffsiteDate, formatTravelLeg, getSchedule, offsiteData } from '@/data/offsite';
import { OverviewView } from '@/presentation/overview-view';
import { useOffsiteNavigation } from '@/screens/navigation';
import { usePreferences } from '@/state/preferences';

export default function OverviewScreen() {
  const { router, activity, location } = useOffsiteNavigation();
  const { attendee, personal } = usePreferences();
  const { event } = offsiteData;
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => { if (state === 'active') setNow(new Date()); });
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => { subscription.remove(); clearInterval(interval); };
  }, []);
  const dateParts = new Intl.DateTimeFormat('en', { timeZone: event.timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const localDate = ['year', 'month', 'day'].map((type) => dateParts.find((part) => part.type === type)?.value).join('-');
  const localTime = new Intl.DateTimeFormat('en-GB', { timeZone: event.timezone, hour: '2-digit', minute: '2-digit', hour12: false }).format(now);
  const next = getSchedule().find((item) => `${item.date} ${item.endTime ?? item.startTime}` >= `${localDate} ${localTime}`);
  return <OverviewView
    title={`Hey, ${attendee?.name.split(' ')[0] ?? 'there'}.`}
    initials={attendee?.name.split(' ').map((part) => part[0]).slice(0, 2).join('') ?? ''}
    season={formatOffsiteDate(event.startDate, { month: 'long' }).toUpperCase()}
    destination={event.country.toUpperCase()}
    year={`’${event.startDate.slice(2, 4)}`}
    dates={`${formatOffsiteDate(event.startDate, { day: 'numeric' })}–${formatOffsiteDate(event.endDate, { day: 'numeric', month: 'short' })}`}
    onProfile={() => router.push('/profile')}
    arrival={{ id: 'overview-arrival', title: 'Your arrival', detail: formatTravelLeg(attendee?.arrival ?? null), onPress: () => router.push('/travel') }}
    upcoming={next ? { id: next.id, eyebrow: `${formatOffsiteDate(next.date, { weekday: 'short', day: 'numeric', month: 'short' })} · ${next.startTime}`,
      title: next.title, description: next.location,
      actions: [{ label: 'View activity', onPress: () => activity(next.id), testID: 'overview-activity', primary: true },
        { label: `${next.location} · Map`, testID: 'overview-map', onPress: () => location(`activity:${next.id}`) }] } : undefined}
    rows={[
      { id: 'overview-plan', title: 'The plan', detail: 'Work, shared activities and team travel', onPress: () => router.navigate('/schedule') },
      { id: 'overview-city', title: 'The city', detail: `${offsiteData.places.length} places, food and practical details`, onPress: () => router.navigate('/oslo') },
      { id: 'overview-packing', title: 'Packing checklist', detail: `${personal.packedItems.length} of ${offsiteData.packing.length} packed`, onPress: () => router.push('/packing') },
    ]}
  />;
}
