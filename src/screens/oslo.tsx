import { offsiteData } from '@/data/offsite';
import { ContentPageView } from '@/presentation/content-page-view';
import { useOffsiteNavigation } from '@/screens/navigation';
import { usePreferences } from '@/state/preferences';

export default function OsloScreen() {
  const { router, location } = useOffsiteNavigation();
  const { personal } = usePreferences();
  return <ContentPageView intro="Your offsite field guide" sections={[
    { id: 'explore', cards: [{ id: 'explore', title: 'A city to explore.', eyebrow: 'COFFEE, FOOD & GOOD COMPANY', description: `${offsiteData.places.length} places from the offsite guide.`,
      actions: [{ label: 'Find a place', testID: 'find-places', primary: true, onPress: () => router.push('/places') }] }],
      rows: [{ id: 'oslo-saved', title: 'Saved places', detail: `${personal.savedPlaceIds.length} saved on this phone`, onPress: () => router.push({ pathname: '/places', params: { saved: 'true' } }) }] },
    { id: 'bases', title: 'Our bases', rows: [
      { id: 'workspace', title: offsiteData.workspace.name, detail: offsiteData.workspace.address, onPress: () => router.push('/bases') },
      { id: 'accommodation', title: `Stay in ${offsiteData.accommodation.area}`, detail: `${offsiteData.accommodation.options.length} apartments in the guide`, onPress: () => router.push({ pathname: '/bases', params: { section: 'stay' } }) },
      { id: 'christian-home', title: offsiteData.support.home.name, detail: offsiteData.support.home.address, onPress: () => location('home:christian') },
    ] },
    { id: 'guide', title: 'The useful things', rows: [
      { id: 'food', title: 'Food to try', detail: 'Norwegian favourites and where to find them', onPress: () => router.push('/food') },
      { id: 'packing', title: 'Packing checklist', detail: 'Layers, rain protection and sauna gear', onPress: () => router.push('/packing') },
      { id: 'practical', title: 'Practical info', detail: 'Money and travel logistics', onPress: () => router.push('/practical') },
    ] },
  ]} />;
}
