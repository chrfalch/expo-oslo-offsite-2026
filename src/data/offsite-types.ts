export const placeCategoryLabels = {
  restaurant: 'Restaurants',
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
  matchedAddress: string;
}

export interface ReferencePoint {
  label: string;
  address: string | null;
  city: string;
  coordinates: Coordinates | null;
  note?: string;
}

export interface Place {
  id: string;
  name: string;
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
  name: string;
  description: string;
  placeIds: string[];
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
  referencePoints: Record<ReferencePointId, ReferencePoint>;
  schedule: ScheduleEvent[];
  places: Place[];
  foodToTry: {
    fromSupermarket: { name: string; description: string; priceNok: string | null }[];
    outAndAbout: LocalFood[];
  };
  expoCustomerApps: {
    name: string;
    emoji: string;
    description: string;
    appStoreUrl: string;
    siteUrl: string | null;
  }[];
  accommodation: {
    area: string;
    note: string;
    status: string;
    verified: boolean;
    verifiedOn: string;
    options: {
      name: string;
      url: string;
      address: string | null;
      coordinates: Coordinates | null;
      status: string;
      verified: boolean;
    }[];
  };
  workspace: {
    name: string;
    address: string;
    area: string;
    url: string;
    notes: string;
    coordinates: Coordinates | null;
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
}

export interface PlaceFilters {
  category?: PlaceCategory;
  /** Searches names, cuisine, neighbourhood, address, descriptions and dishes. */
  query?: string;
  /** Sort by estimated walking time from this base; unknown times sort last. */
  near?: ReferencePointId;
  /** Requires `near`. Places with unknown times are excluded. */
  maxWalkMinutes?: number;
}
