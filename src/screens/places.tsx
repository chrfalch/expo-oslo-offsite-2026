import { useState } from 'react';

import {
  formatWalkTime, getPlaces, offsiteData, placeCategoryLabels,
  type PlaceCategory, type ReferencePointId,
} from '@/data/offsite';
import { PlacesView } from '@/presentation/places-view';

const PAGE_SIZE = 8;
const categories = [{ value: 'all', label: 'All places' },
  ...Object.entries(placeCategoryLabels).map(([value, label]) => ({ value, label }))];
const bases = Object.entries(offsiteData.referencePoints).map(([value, base]) => ({ value, label: base.label }));

export function PlacesBrowser() {
  const [category, setCategory] = useState<PlaceCategory | 'all'>('all');
  const [near, setNear] = useState<ReferencePointId>('rebel');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const places = getPlaces({ category: category === 'all' ? undefined : category, near, query });
  const pageCount = Math.max(1, Math.ceil(places.length / PAGE_SIZE));
  const base = offsiteData.referencePoints[near];
  return (
    <PlacesView
      category={category}
      categories={categories}
      onCategoryChange={(value) => {
        if (value === 'all' || Object.hasOwn(placeCategoryLabels, value)) {
          setCategory(value as PlaceCategory | 'all'); setPage(1);
        }
      }}
      near={near}
      bases={bases}
      onBaseChange={(value) => { if (value === 'rebel' || value === 'torshov') { setNear(value); setPage(1); } }}
      onQueryChange={(value) => { setQuery(value); setPage(1); }}
      walkingNote={[`Walking times are estimates from ${base.label}.`, base.note].filter(Boolean).join(' ')}
      resultSummary={`${places.length} ${places.length === 1 ? 'place' : 'places'}${places.length ? ` · Page ${page} of ${pageCount}` : ''}`}
      places={places.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((place) => ({
        id: place.id,
        eyebrow: [place.cuisine ?? placeCategoryLabels[place.category], place.area].filter(Boolean).join(' · '),
        title: place.name,
        description: place.description,
        details: [[place.address, formatWalkTime(place.walkMinutesFrom[near]),
          place.signatureDish ? `Try: ${place.signatureDish}` : null, place.priceNote,
          place.hours ? `Hours: ${place.hours}` : null,
          place.vinkScore !== null ? `Vink score: ${place.vinkScore}` : null,
          place.coordinates?.precision === 'street' ? 'Location is approximate.' : null,
        ].filter(Boolean).join('\n')],
        links: place.url ? [{ url: place.url, label: `Visit ${place.name}` }] : [],
      }))}
      page={page}
      pageCount={pageCount}
      onPreviousPage={() => setPage(Math.max(1, page - 1))}
      onNextPage={() => setPage(Math.min(pageCount, page + 1))}
    />
  );
}
