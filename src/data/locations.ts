import { offsiteData, type AccommodationPhoto, type Coordinates, type DeepReadonly, type GuideImage, type OffsiteData } from './offsite';
import { formatAccommodationDetails } from './accommodation';
import { attendeeId } from './attendees';

export type GuideLocation = {
  key: string;
  title: string;
  address: string | null;
  coordinates: DeepReadonly<Coordinates> | null;
  notice?: string;
  areaKey?: string;
  searchQuery?: string;
  photos?: readonly DeepReadonly<AccommodationPhoto>[];
  image?: DeepReadonly<GuideImage> | null;
  websiteUrl?: string;
  websiteLabel?: string;
  description?: string;
  details?: readonly string[];
  residents?: readonly string[];
};

export function getLocation(key: string, data: DeepReadonly<OffsiteData> = offsiteData): GuideLocation | undefined {
  const [kind, ...parts] = key.split(':');
  const id = parts.join(':');
  if (kind === 'place') {
    const place = data.places.find((place) => place.id === id);
    if (place) return { key, title: place.name, address: place.address, coordinates: place.coordinates,
      image: place.image, description: place.description, websiteUrl: place.url ?? undefined,
      notice: place.coordinates?.precision === 'street' ? 'Approximate street location, not a confirmed entrance.' : undefined,
      searchQuery: [place.name, place.address, 'Oslo'].filter(Boolean).join(', ') };
  }
  if (kind === 'activity') {
    const event = data.schedule.find((event) => event.id === id);
    if (event) return { key, title: event.location, address: event.address, coordinates: event.coordinates,
      image: event.image, description: event.notes,
      searchQuery: [event.location, event.address, 'Oslo'].filter(Boolean).join(', ') };
  }
  if (key === 'workspace:rebel') return { key, title: data.workspace.name,
    image: data.workspace.image, description: data.workspace.notes, websiteUrl: data.workspace.url,
    address: data.workspace.address, coordinates: data.workspace.coordinates };
  if (key === 'home:christian') return { key, title: data.support.home.name,
    address: data.support.home.address, coordinates: null, description: data.support.home.notes,
    image: data.support.home.image,
    details: [`Phone & WhatsApp · ${data.support.phone}`],
    websiteUrl: data.support.whatsappUrl, websiteLabel: 'Chat on WhatsApp',
    searchQuery: `${data.support.home.address}, ${data.event.country}` };
  if (kind === 'area' && (id === 'torshov' || id === 'rebel')) {
    const area = data.referencePoints[id];
    return { key, title: id === 'torshov' ? 'Torshov area' : area.label,
      address: id === 'torshov' ? 'Approximate neighbourhood centre' : area.address,
      coordinates: area.coordinates,
      notice: id === 'torshov' ? 'This is an approximate area reference, not an apartment entrance.' : area.note };
  }
  if (kind === 'stay') {
    const flat = data.accommodation.options.find((flat) => flat.id === id)
      ?? (/^\d+$/.test(id) ? data.accommodation.options[Number(id)] : undefined);
    if (flat) {
      const residents = flat.residentAttendeeIds.map((residentId) => data.travel.find((person) => attendeeId(person.name) === residentId)?.name).filter((name): name is string => Boolean(name));
      return { key, title: flat.name, address: flat.address, coordinates: flat.coordinates,
      photos: flat.photos, websiteUrl: flat.url, websiteLabel: 'View Airbnb', description: flat.description,
      residents, details: formatAccommodationDetails(flat),
      searchQuery: flat.address ? [flat.address, data.event.city, data.event.country].join(', ') : undefined,
      notice: flat.coordinates?.precision === 'street' ? 'Approximate street location, not a confirmed entrance.'
        : flat.coordinates?.precision === 'approximate' ? 'Approximate area location. Use the street address for directions.'
        : flat.coordinates ? undefined
        : flat.address ? 'The address is confirmed, but a map pin is not available. Open Maps to search for this address.'
        : 'The apartment address is not provided in the guide.',
      areaKey: !flat.coordinates && !flat.address ? 'area:torshov' : undefined };
    }
  }
  if (kind === 'travel') {
    const namedLocation = data.travel.flatMap((person) => [person.arrival?.departsFrom, person.departure?.departsFrom]).find((name) => name === id);
    if (namedLocation) return { key, title: namedLocation, address: null, coordinates: null,
      notice: 'This departure location is named in the guide, but has no coordinates.', searchQuery: namedLocation };
  }
}

export function isApproximateLocation(location: GuideLocation): boolean {
  return !!location.coordinates && (location.key === 'area:torshov' || location.coordinates.precision !== 'address');
}

export function formatLocationAccuracy(location: GuideLocation): string | undefined {
  const c = location.coordinates;
  if (!c) return undefined;
  const accuracy = location.key === 'area:torshov' ? 'Approximate area reference'
    : c.precision === 'street' ? 'Approximate street location'
    : isApproximateLocation(location) ? 'Approximate area location' : 'Address-level location';
  const source = c.source === 'geonorge' ? 'Kartverket' : c.source === 'airbnb-listing' ? 'Airbnb listing' : c.source;
  return `${accuracy} · Source: ${source}\n${c.lat}, ${c.lng}`;
}

export function mapsUrls(location: GuideLocation, platform: 'ios' | 'android' | 'web') {
  const apartmentAddressSearch = location.key.startsWith('stay:') && location.address && location.searchQuery;
  const coordinate = location.coordinates && !(apartmentAddressSearch && isApproximateLocation(location))
    ? `${location.coordinates.lat},${location.coordinates.lng}` : undefined;
  const query = coordinate ?? location.searchQuery;
  const title = isApproximateLocation(location) ? `${location.title} (approximate)` : location.title;
  if (!query) return [];
  const web = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  if (platform === 'ios') return [coordinate
    ? `maps://?ll=${coordinate}&q=${encodeURIComponent(title)}`
    : `maps://?q=${encodeURIComponent(query)}`, web];
  if (platform === 'android') return [coordinate
    ? `geo:${coordinate}?q=${encodeURIComponent(`${coordinate}(${title})`)}`
    : `geo:0,0?q=${encodeURIComponent(query)}`, web];
  return [web];
}
