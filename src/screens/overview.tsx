import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import type { Href } from 'expo-router';
import { formatOffsiteDate, formatTravelLeg, getSchedule, offsiteData } from '@/data/offsite';
import { attendees, getAccommodationResidents } from '@/data/attendees';
import { findAccommodationForAttendee } from '@/data/accommodation';
import { getOffsiteMoment, getUpcomingTravel } from '@/data/offsite-time';
import { getGuideImage } from '@/media/guide-images';
import { OverviewView } from '@/presentation/overview-view';
import { useOffsiteNavigation } from '@/screens/navigation';
import { usePreferences } from '@/state/preferences';
import { useScreenObserve } from '@/screens/use-screen-observe';
import { useWeather } from '@/screens/use-weather';
import { refreshStartupUpdate } from '@/updates/use-startup-update';

export default function OverviewScreen() {
  useScreenObserve();
  const { weather, refresh: refreshWeather } = useWeather();
  const { router, activity, location } = useOffsiteNavigation();
  const { attendee, personal } = usePreferences();
  const { event } = offsiteData;
  const [now, setNow] = useState(() => new Date());
  const [refreshing, setRefreshing] = useState(false);
  const refreshRequest = useRef<Promise<void> | undefined>(undefined);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => { if (state === 'active') setNow(new Date()); });
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => { subscription.remove(); clearInterval(interval); };
  }, []);
  const refresh = useCallback(() => {
    refreshRequest.current ??= (async () => {
      setRefreshing(true);
      setNow(new Date());
      try {
        // Cached results may resolve within one frame; give the native spinner time to be seen.
        await Promise.allSettled([
          refreshWeather(),
          refreshStartupUpdate(),
          new Promise<void>((resolve) => setTimeout(resolve, 800)),
        ]);
      } finally {
        setNow(new Date());
        setRefreshing(false);
      }
    })().finally(() => { refreshRequest.current = undefined; });
  }, [refreshWeather]);
  const moment = getOffsiteMoment(now, event.timezone);
  const { date: localDate, time: localTime } = moment;
  const travelDirection = getUpcomingTravel(attendee, moment);
  const apartment = findAccommodationForAttendee(offsiteData.accommodation.options, attendee?.id);
  const next = getSchedule().find((item) => `${item.date} ${item.endTime ?? item.startTime}` >= `${localDate} ${localTime}`);
  return <OverviewView
    weather={weather}
    refreshing={refreshing}
    onRefresh={refresh}
    onWeather={() => router.push('/weather')}
    title={`Hey, ${attendee?.name.split(' ')[0] ?? 'there'}.`}
    year={`’${event.startDate.slice(2, 4)}`}
    dates={`${formatOffsiteDate(event.startDate, { day: 'numeric' })}–${formatOffsiteDate(event.endDate, { day: 'numeric', month: 'short' })}`}
    onProfile={() => router.push('/profile')}
    onSupport={() => router.push('/support')}
    arrival={{ id: 'overview-travel', icon: '✈️', title: travelDirection ? `Your ${travelDirection}` : 'Your trip',
      detail: travelDirection ? formatTravelLeg(attendee?.[travelDirection] ?? null) : 'Arrival, departure and where to stay', onPress: () => router.push('/travel') }}
    stay={apartment && attendee ? { id: 'overview-apartment', eyebrow: 'YOUR APARTMENT', title: apartment.name,
      description: apartment.address ?? apartment.area,
      housemates: getAccommodationResidents(apartment).filter((person) => person.id !== attendee.id).map((person) => person.name) } : undefined}
    onStay={apartment ? () => location(`stay:${apartment.id}`) : undefined}
    allApartments={{ id: 'overview-all-apartments', icon: '🏘️', title: 'All apartments', detail: 'See who’s staying where',
      onPress: () => router.push({ pathname: '/bases', params: { section: 'stay' } }) }}
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
