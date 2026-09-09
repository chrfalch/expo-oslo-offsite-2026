import { offsiteData, type Coordinates, type DeepReadonly } from './offsite';

export type GuideLocation = {
  key: string;
  title: string;
  address: string | null;
  coordinates: DeepReadonly<Coordinates> | null;
  notice?: string;
  areaKey?: string;
  searchQuery?: string;
};

export function getLocation(key: string): GuideLocation | undefined {
  const [kind, ...parts] = key.split(':');
  const id = parts.join(':');
  if (kind === 'place') {
    const place = offsiteData.places.find((place) => place.id === id);
    if (place) return { key, title: place.name, address: place.address, coordinates: place.coordinates,
      notice: place.coordinates?.precision === 'street' ? 'Approximate street location, not a confirmed entrance.' : undefined,
      searchQuery: [place.name, place.address, 'Oslo'].filter(Boolean).join(', ') };
  }
  if (kind === 'activity') {
    const event = offsiteData.schedule.find((event) => event.id === id);
    if (event) return { key, title: event.location, address: event.address, coordinates: event.coordinates,
      searchQuery: [event.location, event.address, 'Oslo'].filter(Boolean).join(', ') };
  }
  if (key === 'workspace:rebel') return { key, title: offsiteData.workspace.name,
    address: offsiteData.workspace.address, coordinates: offsiteData.workspace.coordinates };
  if (kind === 'area' && (id === 'torshov' || id === 'rebel')) {
    const area = offsiteData.referencePoints[id];
    return { key, title: id === 'torshov' ? 'Torshov area' : area.label,
      address: id === 'torshov' ? 'Approximate neighbourhood centre' : area.address,
      coordinates: area.coordinates,
      notice: id === 'torshov' ? 'This is an approximate area reference, not an apartment entrance.' : area.note };
  }
  if (kind === 'stay' && /^\d+$/.test(id)) {
    const flat = offsiteData.accommodation.options[Number(id)];
    if (flat) return { key, title: flat.name, address: flat.address, coordinates: flat.coordinates,
      notice: flat.coordinates ? undefined : 'The apartment is booked, but its address is not provided in the guide.',
      areaKey: flat.coordinates ? undefined : 'area:torshov' };
  }
  if (kind === 'travel') {
    const namedLocation = offsiteData.travel.flatMap((person) => [person.arrival?.departsFrom, person.departure?.departsFrom]).find((name) => name === id);
    if (namedLocation) return { key, title: namedLocation, address: null, coordinates: null,
      notice: 'This departure location is named in the guide, but has no coordinates.', searchQuery: namedLocation };
  }
}

export function mapsUrls(location: GuideLocation, platform: 'ios' | 'android' | 'web') {
  const coordinate = location.coordinates ? `${location.coordinates.lat},${location.coordinates.lng}` : undefined;
  const query = coordinate ?? location.searchQuery;
  if (!query) return [];
  const web = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  if (platform === 'ios') return [coordinate
    ? `maps://?ll=${coordinate}&q=${encodeURIComponent(location.title)}`
    : `maps://?q=${encodeURIComponent(query)}`, web];
  if (platform === 'android') return [coordinate
    ? `geo:${coordinate}?q=${encodeURIComponent(`${coordinate}(${location.title})`)}`
    : `geo:0,0?q=${encodeURIComponent(query)}`, web];
  return [web];
}
