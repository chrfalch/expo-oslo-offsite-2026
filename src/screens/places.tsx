import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { formatWalkTime, getPlaces, offsiteData, placeCategoryLabels, type PlaceCategory, type ReferencePointId } from '@/data/offsite';
import { OffsiteScreen } from '@/components/offsite-screen';
import { PlacesView } from '@/presentation/places-view';
import { useOffsiteNavigation } from '@/screens/navigation';
import { usePreferences } from '@/state/preferences';

const PAGE_SIZE = 8;
const categories = [{ value: 'all', label: 'All categories' }, ...Object.entries(placeCategoryLabels).map(([value, label]) => ({ value, label }))];
const bases = [{ value: 'rebel', label: 'Rebel' }, { value: 'torshov', label: 'Torshov area' }];

export default function PlacesScreen() {
  const params = useLocalSearchParams<{ saved?: string; category?: string }>();
  const [category, setCategory] = useState<PlaceCategory | 'all'>(params.category && Object.hasOwn(placeCategoryLabels, params.category) ? params.category as PlaceCategory : 'all');
  const [near, setNear] = useState<ReferencePointId>('rebel');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [savedOnly, setSavedOnly] = useState(params.saved === 'true');
  const { personal } = usePreferences();
  const { place: openPlace, location } = useOffsiteNavigation();
  const places = getPlaces({ category: category === 'all' ? undefined : category, near, query }).filter((place) => !savedOnly || personal.savedPlaceIds.includes(place.id));
  const pageCount = Math.max(1, Math.ceil(places.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const base = offsiteData.referencePoints[near];
  return <OffsiteScreen><PlacesView
    savedOnly={savedOnly} savedCount={personal.savedPlaceIds.length}
    onSavedOnlyChange={(value) => { setSavedOnly(value); setPage(1); }}
    category={category} categories={categories}
    onCategoryChange={(value) => { if (value === 'all' || Object.hasOwn(placeCategoryLabels, value)) { setCategory(value as PlaceCategory | 'all'); setPage(1); } }}
    near={near} bases={bases}
    onBaseChange={(value) => { if (value === 'rebel' || value === 'torshov') { setNear(value); setPage(1); } }}
    onQueryChange={(value) => { setQuery(value); setPage(1); }}
    walkingNote={[`Walking times are estimates from ${base.label}.`, base.note].filter(Boolean).join(' ')}
    resultSummary={`${places.length} ${places.length === 1 ? 'place' : 'places'}${places.length ? ` · Page ${currentPage} of ${pageCount}` : ''}`}
    places={places.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((place) => ({
      id: place.id, eyebrow: [place.cuisine ?? placeCategoryLabels[place.category], place.area].filter(Boolean).join(' · '),
      title: place.name, description: formatWalkTime(place.walkMinutesFrom[near]),
      actions: [{ label: 'View place', testID: `place-${place.id}`, onPress: () => openPlace(place.id), primary: true },
        { label: 'Show on map', onPress: () => location(`place:${place.id}`), testID: `map-${place.id}` }],
    }))}
    page={currentPage} pageCount={pageCount}
    onPreviousPage={() => setPage(Math.max(1, currentPage - 1))}
    onNextPage={() => setPage(Math.min(pageCount, currentPage + 1))}
  /></OffsiteScreen>;
}
