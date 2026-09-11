import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { formatAccommodationDetails, formatOffsiteDate, formatWalkTime, getFoodPlaces, getPlaces, offsiteData, orderAccommodationOptions } from '@/data/offsite';
import { getAccommodationResidents } from '@/data/attendees';
import { getAccommodationPhotos, getGuideImage } from '@/media/guide-images';
import { ContentPageView, type ContentSection } from '@/presentation/content-page-view';
import { useOffsiteNavigation } from '@/screens/navigation';
import { usePreferences } from '@/state/preferences';

export function BasesScreen() {
  const params = useLocalSearchParams<{ section?: string }>();
  const [section, setSection] = useState(params.section === 'stay' || params.section === 'home' ? params.section : 'work');
  const { location, router } = useOffsiteNavigation();
  const { attendee } = usePreferences();
  const { workspace: w, accommodation: a, event, support } = offsiteData;
  return <ContentPageView choices={[{ id: 'base-section', label: 'Our bases', value: section, onChange: setSection,
    options: [{ value: 'work', label: 'Workspace' }, { value: 'stay', label: 'Apartments' }, { value: 'home', label: 'Home' }] }]}
    sections={section === 'work' ? [
      { id: 'workspace', cards: [{ id: 'workspace', title: w.name, eyebrow: w.area, description: w.notes, image: getGuideImage(w.image, w.name),
        actions: [{ label: 'Show on map', primary: true, onPress: () => location('workspace:rebel'), testID: 'workspace-map' }], links: [{ label: 'Workspace website', url: w.url }] }] },
      { id: 'working-hours', description: `${event.workingDays.hours}\n${formatOffsiteDate(event.workingDays.startDate)}–${formatOffsiteDate(event.workingDays.endDate)}` },
    ] : section === 'home' ? [
      { id: 'home', cards: [{ id: 'christian-home', title: support.home.name, eyebrow: 'CHRISTIAN’S HOME',
        description: support.home.address, details: [support.home.notes, `Phone & WhatsApp · ${support.phone}`],
        image: getGuideImage(support.home.image, support.home.name),
        actions: [{ label: 'Show on map', primary: true, testID: 'home-map', onPress: () => location('home:christian') },
          { label: 'Contact Christian', testID: 'home-support', onPress: () => router.push('/support') }] }] },
    ] : [
      { id: 'accommodation', title: 'Apartments', description: a.note },
      { id: 'apartments', cards: orderAccommodationOptions(a.options).map((flat) => {
        const details = formatAccommodationDetails(flat);
        const visibleNotes = flat.notes.filter((note) => /floor|lift|elevator/i.test(note));
        const residents = getAccommodationResidents(flat).map((person) => person.name);
        return { id: flat.id, title: flat.name,
          eyebrow: flat.residentAttendeeIds.includes(attendee?.id ?? '') ? 'YOUR APARTMENT' : flat.area.toUpperCase(),
          description: flat.address ?? flat.area, photos: getAccommodationPhotos(flat.photos),
          housemates: residents,
          details: [details[0], details[1], ...(flat.selfCheckIn ? ['Smartlock self check-in'] : []), ...visibleNotes],
          disclosure: { label: 'About this apartment', details: [flat.description, ...details.slice(2).filter((detail) => !visibleNotes.includes(detail) && detail !== 'Self check-in available')] },
          actions: [{ label: 'Directions', primary: true, testID: `apartment-location-${flat.number}`, onPress: () => location(`stay:${flat.id}`) }],
          links: [{ label: 'View Airbnb', url: flat.url }] };
      }) },
    ]} />;
}

export function FoodScreen() {
  const [section, setSection] = useState('out');
  const { place, router } = useOffsiteNavigation();
  const { foodToTry } = offsiteData;
  const restaurants = getPlaces({ category: 'restaurant', near: 'rebel' });
  const sections: ContentSection[] = section === 'restaurants' ? [{
    id: 'restaurants', description: `${restaurants.length} restaurants and food halls · Walking times from Rebel`,
    rows: restaurants.map((venue) => ({
      id: `food-restaurant-${venue.id}`, title: venue.name,
      detail: [venue.cuisine, venue.area, formatWalkTime(venue.walkMinutesFrom.rebel)].filter(Boolean).join(' · '),
      image: getGuideImage(venue.image, venue.name), onPress: () => place(venue.id),
    })),
  }] : section === 'out' ? foodToTry.outAndAbout.map((food) => ({
    id: food.id, title: food.name, description: food.description, image: getGuideImage(food.image, food.name),
    rows: getFoodPlaces(food).map((venue) => ({ id: venue.id, title: venue.name, detail: venue.address ?? venue.area ?? '', onPress: () => place(venue.id) })),
  })) : [
    { id: 'supermarket-food', cards: foodToTry.fromSupermarket.map((food) => ({ id: food.id, title: food.name, description: food.description, image: getGuideImage(food.image, food.name),
      details: food.priceNok ? [`NOK ${food.priceNok} · Guide estimate`] : [] })) },
    { id: 'supermarkets', rows: [{ id: 'find-supermarket', title: 'Find a supermarket', onPress: () => router.push({ pathname: '/places', params: { category: 'supermarket' } }) }] },
  ];
  return <ContentPageView intro="A taste of Norway" choices={[{ id: 'food-section', label: 'Food to try', value: section, onChange: setSection,
    options: [{ value: 'out', label: 'Out & about' }, { value: 'shop', label: 'Supermarket' }, { value: 'restaurants', label: 'Restaurants' }] }]} sections={sections} />;
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
