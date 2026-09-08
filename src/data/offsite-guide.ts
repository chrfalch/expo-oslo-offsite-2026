import type {
  DeepReadonly,
  LocalFood,
  OffsiteData,
  Place,
  PlaceFilters,
  ScheduleEvent,
  TravelDirection,
} from './offsite-types';

/** Protect shared content, including nested arrays, coordinates and notes. */
export function freezeData<T>(value: T): DeepReadonly<T> {
  if (value !== null && typeof value === 'object') {
    for (const child of Object.values(value)) freezeData(child);
    Object.freeze(value);
  }
  return value;
}

function searchText(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
    .replace(/ø/g, 'o').replace(/æ/g, 'ae');
}

function byName(a: { name: string }, b: { name: string }) {
  return a.name.localeCompare(b.name, 'nb');
}

/** Pure selectors, also usable with another typed snapshot in tests or previews. */
export function createOffsiteGuide(data: DeepReadonly<OffsiteData>) {
  const placesById = new Map(data.places.map((place) => [place.id, place]));

  function getPlace(id: string) {
    return placesById.get(id);
  }

  function getPlaces(filters: PlaceFilters = {}): DeepReadonly<Place>[] {
    const { category, near, maxWalkMinutes } = filters;
    if (maxWalkMinutes !== undefined &&
      (!near || !Number.isFinite(maxWalkMinutes) || maxWalkMinutes < 0)) {
      throw new RangeError('maxWalkMinutes requires a base and a finite, non-negative number');
    }
    const terms = searchText(filters.query ?? '').trim().split(/\s+/).filter(Boolean);
    return data.places.filter((place) => {
      if (category && place.category !== category) return false;
      if (near && maxWalkMinutes !== undefined) {
        const minutes = place.walkMinutesFrom[near];
        if (minutes == null || minutes > maxWalkMinutes) return false;
      }
      const text = searchText([
        place.name, place.cuisine, place.area, place.address, place.description, place.signatureDish,
      ].filter(Boolean).join(' '));
      return terms.every((term) => text.includes(term));
    }).sort((a, b) => {
      if (near) {
        const left = a.walkMinutesFrom[near] ?? Infinity;
        const right = b.walkMinutesFrom[near] ?? Infinity;
        if (left !== right) return left - right;
      }
      return byName(a, b) || a.id.localeCompare(b.id);
    });
  }

  function getSchedule(date?: string) {
    return data.schedule.filter((event) => !date || event.date === date)
      .sort((a, b) => a.date.localeCompare(b.date) ||
        a.startTime.localeCompare(b.startTime) || a.id.localeCompare(b.id));
  }

  function getScheduleDays() {
    const days = new Map<string, DeepReadonly<ScheduleEvent>[]>();
    for (const event of getSchedule()) {
      const events = days.get(event.date) ?? [];
      events.push(event);
      days.set(event.date, events);
    }
    return Array.from(days, ([date, events]) => ({ date, events }));
  }

  /** Includes unknown travel last, unless a specific date is requested. */
  function getTravel(direction: TravelDirection = 'arrival', date?: string) {
    return data.travel.map((person) => ({
      name: person.name,
      role: person.role,
      details: person[direction],
    })).filter((person) => !date || person.details?.date === date)
      .sort((a, b) => {
        if (!a.details) return b.details ? 1 : byName(a, b);
        if (!b.details) return -1;
        return a.details.date.localeCompare(b.details.date) ||
          a.details.time.localeCompare(b.details.time) || byName(a, b);
      });
  }

  function getFoodPlaces(food: DeepReadonly<LocalFood>) {
    return food.placeIds.map(getPlace).filter((place): place is DeepReadonly<Place> => !!place);
  }

  return { getPlace, getPlaces, getSchedule, getScheduleDays, getTravel, getFoodPlaces };
}
