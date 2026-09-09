import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { formatAccommodationDetails, formatOffsiteDate, getFoodPlaces, offsiteData } from '@/data/offsite';
import { getAccommodationPhotos, getGuideImage } from '@/media/guide-images';
import { ContentPageView, type ContentSection } from '@/presentation/content-page-view';
import { useOffsiteNavigation } from '@/screens/navigation';

export function BasesScreen() {
  const params = useLocalSearchParams<{ section?: string }>();
  const [section, setSection] = useState(params.section === 'stay' || params.section === 'home' ? params.section : 'work');
  const { location, router } = useOffsiteNavigation();
  const { workspace: w, accommodation: a, event, support } = offsiteData;
  return <ContentPageView choices={[{ id: 'base-section', label: 'Our bases', value: section, onChange: setSection,
    options: [{ value: 'work', label: 'Workspace' }, { value: 'stay', label: 'Apartments' }, { value: 'home', label: 'Home' }] }]}
    sections={section === 'work' ? [
      { id: 'workspace', cards: [{ id: 'workspace', title: w.name, eyebrow: w.area, description: w.notes, image: getGuideImage(w.image, w.name),
        actions: [{ label: 'Show on map', primary: true, onPress: () => location('workspace:rebel'), testID: 'workspace-map' }], links: [{ label: 'Workspace website', url: w.url }] }] },
      { id: 'working-hours', description: `${event.workingDays.hours}\n${formatOffsiteDate(event.workingDays.startDate)}–${formatOffsiteDate(event.workingDays.endDate)}` },
    ] : section === 'home' ? [
      { id: 'home', cards: [{ id: 'christian-home', title: support.home.name, eyebrow: 'SUPPORT HQ',
        description: support.home.address, details: [support.home.notes, `Phone & WhatsApp · ${support.phone}`],
        image: getGuideImage(support.home.image, support.home.name),
        actions: [{ label: 'Show on map', primary: true, testID: 'home-map', onPress: () => location('home:christian') },
          { label: 'Contact Christian', testID: 'home-support', onPress: () => router.push('/support') }] }] },
    ] : [
      { id: 'accommodation', title: a.area, description: `${a.options.length} apartments · ${a.status}. Exact addresses are in the booking confirmations; map pins are approximate.`,
        disclosure: { label: 'Booking and location notes', details: [a.note, a.coordinatePrecisionNote] },
        rows: [{ id: 'torshov-map', title: 'Show Torshov area', detail: 'Approximate neighbourhood centre', onPress: () => location('area:torshov') }] },
      { id: 'apartments', cards: a.options.map((flat, index) => ({ id: flat.id, title: flat.name, eyebrow: `${flat.status.toUpperCase()} · ${flat.area}`, description: flat.address ?? 'Exact address not provided', photos: getAccommodationPhotos(flat.photos),
        details: formatAccommodationDetails(flat).slice(0, 2), disclosure: { label: 'About this apartment', details: [flat.description, ...formatAccommodationDetails(flat).slice(2)] },
        actions: [{ label: 'Location details', primary: true, testID: `apartment-location-${index}`, onPress: () => location(`stay:${flat.id}`) }], links: [{ label: 'View Airbnb', url: flat.url }] })) },
    ]} />;
}

export function FoodScreen() {
  const [section, setSection] = useState('out');
  const { place, router } = useOffsiteNavigation();
  const { foodToTry } = offsiteData;
  const sections: ContentSection[] = section === 'out' ? foodToTry.outAndAbout.map((food) => ({
    id: food.id, title: food.name, description: food.description, image: getGuideImage(food.image, food.name),
    rows: getFoodPlaces(food).map((venue) => ({ id: venue.id, title: venue.name, detail: venue.address ?? venue.area ?? '', onPress: () => place(venue.id) })),
  })) : [
    { id: 'supermarket-food', cards: foodToTry.fromSupermarket.map((food) => ({ id: food.id, title: food.name, description: food.description, image: getGuideImage(food.image, food.name),
      details: food.priceNok ? [`NOK ${food.priceNok} · Guide estimate`] : [] })) },
    { id: 'supermarkets', rows: [{ id: 'find-supermarket', title: 'Find a supermarket', onPress: () => router.push({ pathname: '/places', params: { category: 'supermarket' } }) }] },
  ];
  return <ContentPageView intro="A taste of Norway" choices={[{ id: 'food-section', label: 'Food to try', value: section, onChange: setSection,
    options: [{ value: 'out', label: 'Out & about' }, { value: 'shop', label: 'Supermarket' }] }]} sections={sections} />;
}

export function PracticalScreen() {
  const [section, setSection] = useState('faq');
  const { router } = useOffsiteNavigation();
  const { faq, logistics, event } = offsiteData;
  const sections: ContentSection[] = section === 'faq' ? [
    { id: 'faq', cards: faq.map((item) => ({ id: item.question, title: item.question, description: item.answer })) },
    { id: 'basics', description: `Currency · ${event.currency}\nTime zone · ${event.timezone}` },
  ] : [
    { id: 'logistics', cards: [{ id: 'flights', title: 'Flights', description: logistics.flights },
      { id: 'travel-doc', title: 'Travel details', description: logistics.travelDoc }, { id: 'registration', title: 'Registration', description: logistics.registration }] },
    { id: 'itinerary', rows: [{ id: 'open-travel', title: 'My trip & team travel', onPress: () => router.push('/travel') }] },
  ];
  return <ContentPageView choices={[{ id: 'practical-section', label: 'Practical info', value: section, onChange: setSection,
    options: [{ value: 'faq', label: 'FAQ' }, { value: 'travel', label: 'Travel info' }] }]} sections={sections} />;
}
