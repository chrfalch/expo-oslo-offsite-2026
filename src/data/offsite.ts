import snapshot from './offsite-data.json';
import { createOffsiteGuide, freezeData } from './offsite-guide';
import { formatOffsiteDate } from './offsite-format';
import { guideImageTypes, placeCategoryLabels } from './offsite-types';
import type { DeepReadonly, GuideImage, OffsiteData, PlaceCategory } from './offsite-types';

export * from './offsite-types';
export * from './offsite-format';
export * from './accommodation';

function isPlaceCategory(value: string): value is PlaceCategory {
  return Object.hasOwn(placeCategoryLabels, value);
}

function withImage<T extends { image?: Omit<GuideImage, 'type'> & { type: string } | null }>(entity: T) {
  const image = entity.image;
  if (!image) return { ...entity, image };
  const type = guideImageTypes.find((type) => type === image.type);
  if (!type) throw new Error(`Unknown image type "${image.type}" for ${image.file}`);
  return { ...entity, image: { ...image, type } };
}

// A static import includes the complete snapshot in the native and web bundles.
// Screens need no network, filesystem permission, provider, or loading state.
export const offsiteData: DeepReadonly<OffsiteData> = freezeData({
  ...snapshot,
  places: snapshot.places.map((place) => {
    if (!isPlaceCategory(place.category)) {
      throw new Error(`Unknown place category "${place.category}" for ${place.id}`);
    }
    return withImage({ ...place, category: place.category });
  }),
  schedule: snapshot.schedule.map(withImage),
  foodToTry: {
    fromSupermarket: snapshot.foodToTry.fromSupermarket.map(withImage),
    outAndAbout: snapshot.foodToTry.outAndAbout.map(withImage),
  },
  expoCustomerApps: snapshot.expoCustomerApps.map(withImage),
  workspace: withImage(snapshot.workspace),
  support: { ...snapshot.support, home: withImage(snapshot.support.home) },
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
