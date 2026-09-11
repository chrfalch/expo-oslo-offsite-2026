import { Stack, useLocalSearchParams } from 'expo-router';
import { formatBookingStatus, formatEventTime, formatOffsiteDate, formatWalkTime, getPlace, offsiteData, placeCategoryLabels } from '@/data/offsite';
import { getGuideImage } from '@/media/guide-images';
import { ContentPageView } from '@/presentation/content-page-view';
import { useOffsiteNavigation } from '@/screens/navigation';
import { usePreferences } from '@/state/preferences';

export function PlaceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const place = getPlace(id);
  const { personal, store } = usePreferences();
  const { location, router } = useOffsiteNavigation();
  if (!place) return <ContentPageView sections={[{ id: 'missing-place', title: 'Place not found', rows: [{ id: 'browse', title: 'Browse places', onPress: () => router.replace('/places') }] }]} />;
  const saved = personal.savedPlaceIds.includes(place.id);
  return <><Stack.Screen options={{ title: place.name }} /><ContentPageView intro={[placeCategoryLabels[place.category], place.cuisine, place.area].filter(Boolean).join(' · ')} sections={[
    { id: 'place', cards: [{ id: place.id, title: place.name, description: place.description, image: getGuideImage(place.image, place.name),
      headerActions: [{ label: saved ? `Remove ${place.name} from saved places` : `Save ${place.name}`, icon: saved ? 'star.fill' : 'star', testID: 'save-place', selected: saved,
          onPress: () => { void store.togglePlace(place.id); } }] }] },
    { id: 'getting-there', rows: [{ id: 'place-map', title: 'Getting there', detail: place.address ?? 'Location details', onPress: () => location(`place:${place.id}`) }] },
    { id: 'walking-times', description: 'Walking times are estimates from the guide’s reference points, not your current position or a measured route.', rows: [
      { id: 'walk-rebel', title: 'From Rebel', detail: formatWalkTime(place.walkMinutesFrom.rebel), onPress: () => location('workspace:rebel') },
      { id: 'walk-torshov', title: 'From Torshov area', detail: formatWalkTime(place.walkMinutesFrom.torshov), onPress: () => location('area:torshov') },
    ] },
    ...(place.signatureDish ? [{ id: 'signature', title: 'Try this', description: place.signatureDish }] : []),
    { id: 'guide-details', cards: [{ id: 'guide-details', title: 'From the guide',
      description: [place.hours ? `Hours: ${place.hours}` : 'Opening hours not provided.', place.priceNote,
        place.vinkScore !== null ? `Vink score: ${place.vinkScore}` : null].filter(Boolean).join('\n'),
      details: ['Opening hours and prices may change.'], links: place.url ? [{ label: 'Visit website', url: place.url }] : [] }] },
  ]} /></>;
}

export function ActivityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const event = offsiteData.schedule.find((event) => event.id === id);
  const { location, router } = useOffsiteNavigation();
  if (!event) return <ContentPageView sections={[{ id: 'missing-event', title: 'Activity not found', rows: [{ id: 'schedule', title: 'See the schedule', onPress: () => router.replace('/schedule') }] }]} />;
  return <><Stack.Screen options={{ title: event.title }} /><ContentPageView intro="Team activity · Oslo local time" sections={[
    { id: 'activity', cards: [{ id, title: event.title, image: getGuideImage(event.image, event.location), eyebrow: formatBookingStatus(event.booked).toUpperCase(),
      description: `${formatOffsiteDate(event.date, { weekday: 'long', day: 'numeric', month: 'long' })}\n${formatEventTime(event)}` }] },
    { id: 'venue', title: 'Where', rows: [{ id: 'activity-map', title: event.location, detail: event.address ?? 'Address not provided', onPress: () => location(`activity:${id}`) }] },
    { id: 'event-notes', title: 'Good to know', description: event.notes,
      rows: id === 'sauna' ? [{ id: 'sauna-packing', title: 'Open packing checklist', onPress: () => router.push('/packing') }] : [] },
  ]} /></>;
}
