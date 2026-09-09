import { useLocalSearchParams } from 'expo-router';
import { useHeaderHeight } from 'expo-router/react-navigation';
import { useRef, useState } from 'react';
import type { SearchBarCommands } from 'react-native-screens';
import { PlacesNavigation } from '@/components/places-navigation';
import { formatWalkTime, getPlaces, placeCategoryLabels, type PlaceCategory, type ReferencePointId } from '@/data/offsite';
import { getGuideImage } from '@/media/guide-images';
import { PlacesView } from '@/presentation/places-view';
import { useOffsiteNavigation } from '@/screens/navigation';
import { useScreenObserve } from '@/screens/use-screen-observe';
import { usePreferences } from '@/state/preferences';

const categories = [{ value: 'all', label: 'All categories' }, ...Object.entries(placeCategoryLabels).map(([value, label]) => ({ value, label }))];
const bases = [{ value: 'rebel', label: 'Rebel' }, { value: 'torshov', label: 'Torshov area' }];

export default function PlacesScreen() {
  useScreenObserve();
  const headerHeight = useHeaderHeight();
  const params = useLocalSearchParams<{ saved?: string; category?: string }>();
  const [category, setCategory] = useState<PlaceCategory | 'all'>(params.category && Object.hasOwn(placeCategoryLabels, params.category) ? params.category as PlaceCategory : 'all');
  const [near, setNear] = useState<ReferencePointId>('rebel');
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [savedOnly, setSavedOnly] = useState(params.saved === 'true');
  const searchRef = useRef<SearchBarCommands>(null);
  const { personal, store } = usePreferences();
  const { place: openPlace } = useOffsiteNavigation();
  const places = getPlaces({ category: category === 'all' ? undefined : category, near, query }).filter((place) => !savedOnly || personal.savedPlaceIds.includes(place.id));
  const onCategoryChange = (value: string) => { if (value === 'all' || Object.hasOwn(placeCategoryLabels, value)) setCategory(value as PlaceCategory | 'all'); };
  const onBaseChange = (value: string) => { if (value === 'rebel' || value === 'torshov') setNear(value); };
  const noSaved = savedOnly && personal.savedPlaceIds.length === 0;
  return <>
    <PlacesView savedOnly={savedOnly} savedCount={personal.savedPlaceIds.length} onSavedOnlyChange={setSavedOnly}
      category={category} categories={categories} onCategoryChange={onCategoryChange} near={near} bases={bases} onBaseChange={onBaseChange}
      query={query} onQueryChange={setQuery} searching={searching} headerHeight={headerHeight}
      filterSummary={`${category === 'all' ? 'Estimated walk' : placeCategoryLabels[category]} from ${near === 'rebel' ? 'Rebel' : 'Torshov area'}`}
      places={places.map((place) => ({ id: place.id, title: place.name,
        subtitle: [place.cuisine ?? placeCategoryLabels[place.category], place.area].filter(Boolean).join(' · '),
        walk: place.walkMinutesFrom[near] === 0 ? `Near ${near === 'rebel' ? 'Rebel' : 'Torshov reference point'}` : formatWalkTime(place.walkMinutesFrom[near]),
        image: getGuideImage(place.image, place.name), saved: personal.savedPlaceIds.includes(place.id),
        onPress: () => openPlace(place.id), onSave: () => store.togglePlace(place.id),
      }))}
      emptyTitle={noSaved ? 'Your Oslo shortlist' : 'No places match'}
      emptyDescription={noSaved ? 'Tap a bookmark to keep a place here for later.' : 'Try another search or clear your filters.'}
      resetLabel={noSaved ? 'Explore all places' : 'Clear search and filters'}
      onReset={() => { searchRef.current?.clearText(); setQuery(''); setCategory('all'); if (noSaved) setSavedOnly(false); }} />
    <PlacesNavigation searchRef={searchRef} onQueryChange={setQuery} onSearchingChange={setSearching}
      category={category} categories={categories} onCategoryChange={onCategoryChange} near={near} bases={bases} onBaseChange={onBaseChange} />
  </>;
}
