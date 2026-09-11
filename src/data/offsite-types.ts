export const placeCategoryLabels = {
  restaurant: 'Restaurants',
  foodhall: 'Food halls',
  lunch: 'Lunch',
  coffee: 'Coffee',
  activity: 'Activities',
  bar: 'Bars',
  snack: 'Snacks & bakeries',
  supermarket: 'Supermarkets',
} as const;

export type PlaceCategory = keyof typeof placeCategoryLabels;
export type ReferencePointId = 'rebel' | 'torshov';
export type TravelDirection = 'arrival' | 'departure';
export type DeepReadonly<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> };

export interface Coordinates {
  lat: number;
  lng: number;
  precision: string;
  source: string;
  matchedAddress: string | null;
}

export interface ReferencePoint {
  label: string;
  address: string | null;
  city: string;
  coordinates: Coordinates | null;
  note?: string;
}

export const guideImageTypes = ['photo', 'logo', 'icon', 'artwork'] as const;

export interface GuideImage {
  /** Project-relative path included by the static guide image registry. */
  file: string;
  type: typeof guideImageTypes[number];
  /** Provenance only; images load from bundled assets. */
  sourceUrl: string;
  sourcePage: string;
  sourceDomain: string;
  credit: string | null;
  licence: string | null;
  licenceUrl?: string;
  /** Preserve the complete frame for photos used to recognise an entrance. */
  aspectRatio?: number;
}

export interface Place {
  id: string;
  name: string;
  formerNames?: string[] | null;
  category: PlaceCategory;
  cuisine: string | null;
  description: string;
  address: string | null;
  area: string | null;
  walkMinutesFrom: Partial<Record<ReferencePointId, number | null>>;
  distanceMetersFrom: Partial<Record<ReferencePointId, number | null>>;
  vinkScore: number | null;
  signatureDish: string | null;
  priceNote: string | null;
  hours: string | null;
  url: string | null;
  coordinates: Coordinates | null;
  image?: GuideImage | null;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  type: string;
  date: string;
  startTime: string;
  endTime: string | null;
  location: string;
  address: string | null;
  booked: boolean | null;
  notes: string;
  coordinates: Coordinates | null;
  image?: GuideImage | null;
}

export interface TravelLeg {
  date: string;
  time: string;
  flight: string | null;
  note?: string | null;
  departsFrom?: string;
  departureDate?: string;
  departureTime?: string;
}

export interface Traveler {
  name: string;
  role: string;
  arrival: TravelLeg | null;
  departure: TravelLeg | null;
}

export interface LocalFood {
  id: string;
  name: string;
  description: string;
  placeIds: string[];
  image?: GuideImage | null;
}

export interface AccommodationPhoto {
  /** Project-relative path included by the static guide image registry. */
  file: string;
  /** Original listing image URL, kept for provenance rather than image loading. */
  sourceUrl: string;
  caption: string | null;
}

export interface AccommodationOption {
  id: string;
  name: string;
  url: string;
  listingId: string;
  area: string;
  address: string | null;
  coordinates: Coordinates | null;
  photos: AccommodationPhoto[];
  status: string;
  verified: boolean;
  hostName: string;
  hostNote: string | null;
  rating: number | null;
  reviewCount: number;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  extraBeds: number;
  bathrooms: number;
  floor: number | null;
  elevator: boolean | null;
  selfCheckIn: boolean | null;
  checkInFrom: string | null;
  checkInUntil: string | null;
  checkOutBy: string | null;
  description: string;
  neighbourhoodNote: string;
  amenities: string[];
  amenitiesMissing: string[];
  notes: string[];
  distanceMetersFrom: Partial<Record<ReferencePointId, number | null>>;
  walkMinutesFrom: Partial<Record<ReferencePointId, number | null>>;
}

export interface OffsiteData {
  schemaVersion: string;
  generatedAt: string;
  source: { name: string; url: string; pageLastEditedAt: string; note: string };
  event: {
    name: string;
    city: string;
    country: string;
    startDate: string;
    endDate: string;
    organizer: string;
    focus: string;
    workingDays: { startDate: string; endDate: string; hours: string; note: string };
    currency: string;
    timezone: string;
  };
  support: {
    phone: string;
    phoneUrl: string;
    whatsappUrl: string;
    home: { name: string; address: string; notes: string; image?: GuideImage | null };
  };
  referencePoints: Record<ReferencePointId, ReferencePoint>;
  schedule: ScheduleEvent[];
  places: Place[];
  foodToTry: {
    fromSupermarket: { id: string; name: string; description: string; priceNok: string | null; image?: GuideImage | null }[];
    outAndAbout: LocalFood[];
  };
  expoCustomerApps: {
    id: string;
    name: string;
    emoji: string;
    description: string;
    appStoreUrl: string;
    googlePlayUrl: string;
    siteUrl: string | null;
    image?: GuideImage | null;
  }[];
  accommodation: {
    area: string;
    note: string;
    status: string;
    verified: boolean;
    verifiedOn: string;
    totalMaxGuests: number;
    totalBedrooms: number;
    coordinatePrecisionNote: string;
    options: AccommodationOption[];
  };
  workspace: {
    name: string;
    address: string;
    area: string;
    url: string;
    notes: string;
    coordinates: Coordinates | null;
    image?: GuideImage | null;
  };
  packing: { item: string; notes: string[] }[];
  packingNote: string;
  faq: { question: string; answer: string }[];
  travel: Traveler[];
  logistics: { flights: string; travelDoc: string; registration: string };
  geo: {
    coordinateSystem: string;
    geocodingSource: string;
    geocodedOn: string;
    precisionValues: string[];
    walkEstimate: string;
  };
  assets: {
    basePath: string;
    note: string;
    folders: Record<'accommodation' | 'places' | 'food' | 'apps' | 'schedule' | 'workspace', string>;
    imageFormats: string[];
    rightsNote: string;
  };
}

export interface PlaceFilters {
  category?: PlaceCategory;
  /** Searches names (including former names), cuisine, neighbourhood, address, descriptions and dishes. */
  query?: string;
  /** Sort by estimated walking time from this base; unknown times sort last. */
  near?: ReferencePointId;
  /** Requires `near`. Places with unknown times are excluded. */
  maxWalkMinutes?: number;
}
