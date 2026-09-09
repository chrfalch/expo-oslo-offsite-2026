import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking } from 'react-native';
import { formatOffsiteDate, offsiteData } from '@/data/offsite';
import { ContentPageView, type ContentSection } from '@/presentation/content-page-view';
import { useOffsiteNavigation } from '@/screens/navigation';
import { usePreferences } from '@/state/preferences';

export function ProfileScreen() {
  const { attendee, personal, saving } = usePreferences();
  const { router } = useOffsiteNavigation();
  const [linkError, setLinkError] = useState<string | null>(null);
  const openSupportPage = async (path: string) => {
    setLinkError(null);
    try {
      await Linking.openURL(`https://oslo-offsite-2026.expo.app/${path}`);
    } catch {
      setLinkError('The page could not be opened. Please try again, or contact christian@expo.dev.');
    }
  };
  return <ContentPageView intro="Your offsite, on this phone" sections={[
    { id: 'identity', cards: [{ id: 'identity', eyebrow: 'USING THIS APP AS', title: attendee?.name ?? '', description: 'Attendee',
      actions: [{ label: 'Change attendee', testID: 'change-attendee', onPress: () => router.push('/choose-attendee') }] }] },
    { id: 'personal', rows: [
      { id: 'my-trip', title: 'My trip', detail: 'Your arrival and departure', onPress: () => router.push('/travel') },
      { id: 'saved-places', title: 'Saved places', detail: `${personal.savedPlaceIds.length} saved`, onPress: () => router.push({ pathname: '/places', params: { saved: 'true' } }) },
      { id: 'packing-checklist', title: 'Packing checklist', detail: `${personal.packedItems.length} of ${offsiteData.packing.length} packed`, onPress: () => router.push('/packing') },
    ] },
    { id: 'device', cards: [{ id: 'device', title: saving ? 'Saving on this phone…' : 'Kept on this phone',
      description: 'Your chosen name, saved places and packing checklist stay here. Changing attendee keeps each person’s list separate. Nothing syncs to other phones.' }] },
    { id: 'about', title: 'About this guide', description: `Guide snapshot: ${offsiteData.generatedAt}. Guide content is available offline. Maps and external links may need a connection.` },
    { id: 'help', title: 'Privacy and support', description: linkError ?? undefined, rows: [
      { id: 'privacy-policy', title: 'Privacy policy', detail: 'How this app handles your information', onPress: () => { void openSupportPage('privacy.html'); } },
      { id: 'app-support', title: 'Support and feedback', detail: 'Get help or report a guide correction', onPress: () => { void openSupportPage(''); } },
    ] },
  ]} />;
}

export function PackingScreen() {
  const { attendee, personal, store } = usePreferences();
  const { activity } = useOffsiteNavigation();
  const sauna = offsiteData.schedule.find((event) => event.id === 'sauna');
  return <ContentPageView intro={`${attendee?.name} · Saved on this phone`} sections={[
    { id: 'packing-progress', title: `${personal.packedItems.length} of ${offsiteData.packing.length} packed`,
      checks: offsiteData.packing.map((item, index) => ({ id: `packing-item-${index}`, label: item.item, detail: item.notes.join('. '),
        checked: personal.packedItems.includes(item.item), onToggle: () => { void store.togglePacking(item.item); } })) },
    { id: 'packing-note', description: offsiteData.packingNote,
      rows: sauna ? [{ id: 'packing-sauna', title: sauna.title, detail: formatOffsiteDate(sauna.date), onPress: () => activity(sauna.id) }] : [] },
  ]} />;
}

export function TravelScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = useState(params.mode === 'all' ? 'all' : 'mine');
  const { attendee } = usePreferences();
  const { location, router } = useOffsiteNavigation();
  const travelers = mode === 'mine' ? (attendee ? [attendee] : []) : offsiteData.travel;
  const sections: ContentSection[] = travelers.map((person) => ({
    id: person.name, title: person.name,
    cards: (['arrival', 'departure'] as const).map((direction) => {
      const leg = person[direction];
      return { id: direction, eyebrow: direction.toUpperCase(), title: leg ? formatOffsiteDate(leg.date) : 'Not provided',
        description: leg ? `${leg.time} · ${leg.flight ?? 'Flight number not provided'}` : `No ${direction} details in the guide.`,
        details: [leg?.departureDate ? `Departs ${formatOffsiteDate(leg.departureDate)} at ${leg.departureTime}, local departure time.` : '', leg?.note ? 'Check the itinerary note against your ticket.' : ''].filter(Boolean),
        disclosure: leg?.note ? { label: 'Itinerary note', details: [leg.note] } : undefined,
        actions: leg?.departsFrom ? [{ label: `From ${leg.departsFrom} · Location`, onPress: () => location(`travel:${leg.departsFrom}`) }] : [] };
    }),
  }));
  return <ContentPageView intro="Oslo arrivals and departures use local Oslo time. Earlier inbound departure times are shown separately."
    choices={[{ id: 'travel-mode', label: 'Itinerary', value: mode, options: [{ value: 'mine', label: 'My trip' }, { value: 'all', label: 'Everyone' }], onChange: setMode }]}
    sections={[...sections, { id: 'travel-bases', rows: [
      { id: 'travel-stay', title: 'Where we’re staying', detail: `${offsiteData.accommodation.area} · ${offsiteData.accommodation.options.length} apartments`, onPress: () => router.push({ pathname: '/bases', params: { section: 'stay' } }) },
      { id: 'travel-workspace', title: 'Rebel', detail: offsiteData.workspace.address, onPress: () => location('workspace:rebel') },
    ] }]} />;
}
