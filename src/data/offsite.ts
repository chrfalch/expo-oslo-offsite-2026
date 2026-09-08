import snapshot from './offsite-data.json';
import { createOffsiteGuide, freezeData } from './offsite-guide';
import { formatOffsiteDate } from './offsite-format';
import { placeCategoryLabels } from './offsite-types';
import type { DeepReadonly, OffsiteData, PlaceCategory } from './offsite-types';

export * from './offsite-types';
export * from './offsite-format';

function isPlaceCategory(value: string): value is PlaceCategory {
  return Object.hasOwn(placeCategoryLabels, value);
}

// A static import includes the complete snapshot in the native and web bundles.
// Screens need no network, filesystem permission, provider, or loading state.
export const offsiteData: DeepReadonly<OffsiteData> = freezeData({
  ...snapshot,
  places: snapshot.places.map((place) => {
    if (!isPlaceCategory(place.category)) {
      throw new Error(`Unknown place category "${place.category}" for ${place.id}`);
    }
    return { ...place, category: place.category };
  }),
});

export const offsiteGuide = createOffsiteGuide(offsiteData);
export const { getPlace, getPlaces, getSchedule, getScheduleDays, getTravel, getFoodPlaces } =
  offsiteGuide;

// Preserve the scaffold's metadata API, deriving every value from the snapshot.
export const offsite = Object.freeze({
  ...offsiteData.event,
  month: formatOffsiteDate(offsiteData.event.startDate, { month: 'long', year: 'numeric' }),
  location: `${offsiteData.event.city}, ${offsiteData.event.country}`,
  timeZone: offsiteData.event.timezone,
});
