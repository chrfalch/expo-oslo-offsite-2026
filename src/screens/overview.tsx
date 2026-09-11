import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import type { Href } from 'expo-router';
import { formatOffsiteDate, formatTravelLeg, getSchedule, offsiteData } from '@/data/offsite';
import { attendees, formatHousemates } from '@/data/attendees';
import { findAccommodationForAttendee } from '@/data/accommodation';
import { getOffsiteMoment, getUpcomingTravel } from '@/data/offsite-time';
import { getGuideImage } from '@/media/guide-images';
import { OverviewView } from '@/presentation/overview-view';
import { useOffsiteNavigation } from '@/screens/navigation';
import { usePreferences } from '@/state/preferences';
import { useScreenObserve } from '@/screens/use-screen-observe';
import { useWeather } from '@/screens/use-weather';

export default function OverviewScreen() {
  useScreenObserve();
  const { weather } = useWeather();
  const { router, activity, location } = useOffsiteNavigation();
  const { attendee, personal } = usePreferences();
  const { event } = offsiteData;
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => { if (state === 'active') setNow(new Date()); });
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => { subscription.remove(); clearInterval(interval); };
  }, []);
  const moment = getOffsiteMoment(now, event.timezone);
  const { date: localDate, time: localTime } = moment;
  const travelDirection = getUpcomingTravel(attendee, moment);
  const apartment = findAccommodationForAttendee(offsiteData.accommodation.options, attendee?.id);
  const next = getSchedule().find((item) => `${item.date} ${item.endTime ?? item.startTime}` >= `${localDate} ${localTime}`);
  return <OverviewView
    weather={weather}
    onWeather={() => router.push('/weather')}
    title={`Hey, ${attendee?.name.split(' ')[0] ?? 'there'}.`}
    year={`’${event.startDate.slice(2, 4)}`}
    dates={`${formatOffsiteDate(event.startDate, { day: 'numeric' })}–${formatOffsiteDate(event.endDate, { day: 'numeric', month: 'short' })}`}
    onProfile={() => router.push('/profile')}
    onSupport={() => router.push('/support')}
    arrival={{ id: 'overview-travel', icon: '✈️', title: travelDirection ? `Your ${travelDirection}` : 'Your trip',
      detail: travelDirection ? formatTravelLeg(attendee?.[travelDirection] ?? null) : 'Arrival, departure and where to stay', onPress: () => router.push('/travel') }}
    stay={apartment && attendee ? { id: 'overview-apartment', eyebrow: 'YOUR APARTMENT', title: apartment.name,
      description: apartment.address ?? apartment.area, details: [formatHousemates(apartment, attendee.id)] } : undefined}
    onStay={apartment ? () => location(`stay:${apartment.id}`) : undefined}
    upcoming={next ? { id: next.id, eyebrow: `${formatOffsiteDate(next.date, { weekday: 'short', day: 'numeric', month: 'short' })} · ${next.startTime}`,
      title: next.title, description: next.location, image: getGuideImage(next.image, next.location),
      onPress: () => activity(next.id) } : undefined}
    rows={[
      { id: 'overview-work', icon: '💻', title: 'Rebel workspace', detail: offsiteData.workspace.address, onPress: () => location('workspace:rebel') },
      { id: 'overview-team', icon: '👋', title: 'My Team', detail: `${attendees.length} arrivals in Oslo`, onPress: () => router.push('/team' as Href) },
      { id: 'overview-packing', icon: '🎒', title: 'Packing checklist', detail: `${personal.packedItems.length} of ${offsiteData.packing.length} packed`, onPress: () => router.push('/packing') },
      { id: 'overview-products', icon: '🚀', title: 'Expo products to try', detail: `${offsiteData.expoCustomerApps.length} apps to explore`, onPress: () => router.push('/products') },
    ]}
  />;
}
