export const OSLO_TIME_ZONE = 'Europe/Oslo';

export type WeatherInterval = {
  precipitationMm: number | null;
  symbolCode: string | null;
};

export type WeatherForecastPoint = {
  time: string;
  timestamp: number;
  temperatureC: number | null;
  windSpeedMs: number | null;
  next1Hours: WeatherInterval | null;
  next6Hours: WeatherInterval | null;
  next12Hours: WeatherInterval | null;
};

export type WeatherForecast = {
  updatedAt: string | null;
  points: readonly WeatherForecastPoint[];
};

export type CurrentWeather = {
  time: string;
  temperatureC: number | null;
  windSpeedMs: number | null;
  precipitationMm: number | null;
  precipitationHours: 1 | 6 | null;
  symbolCode: string | null;
  symbolLabel: string | null;
  symbolEmoji: string | null;
};

export type WeatherDay = {
  date: string;
  isToday: boolean;
  available: boolean;
  temperatureScope: 'remaining-today' | 'forecast-temperatures';
  highC: number | null;
  lowC: number | null;
  precipitationMm: number | null;
  symbolCode: string | null;
  symbolLabel: string | null;
  symbolEmoji: string | null;
};

export type WeatherView = {
  current: CurrentWeather | null;
  days: readonly WeatherDay[];
};

type UnknownRecord = Record<string, unknown>;

function record(value: unknown, path: string): UnknownRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError(`Invalid MET forecast: ${path} must be an object`);
  }
  return value as UnknownRecord;
}

function optionalFiniteNumber(value: unknown, path: string): number | null {
  if (value === undefined) return null;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`Invalid MET forecast: ${path} must be a finite number`);
  }
  return value;
}

function optionalSymbol(value: unknown, path: string): string | null {
  if (value === undefined) return null;
  if (typeof value !== 'string' || value.trim() === '') {
    throw new TypeError(`Invalid MET forecast: ${path} must be a non-empty string`);
  }
  return value;
}

function parseInterval(value: unknown, path: string): WeatherInterval | null {
  if (value === undefined) return null;
  const interval = record(value, path);
  const details = record(interval.details, `${path}.details`);
  return {
    precipitationMm: optionalFiniteNumber(details.precipitation_amount, `${path}.details.precipitation_amount`),
    symbolCode: optionalSymbol(interval.summary === undefined ? undefined : record(interval.summary, `${path}.summary`).symbol_code,
      `${path}.summary.symbol_code`),
  };
}

function assertUnits(meta: UnknownRecord) {
  const units = record(meta.units, 'properties.meta.units');
  const expected = { air_temperature: 'celsius', wind_speed: 'm/s', precipitation_amount: 'mm' } as const;
  for (const [key, unit] of Object.entries(expected)) {
    if (units[key] !== unit) throw new TypeError(`Invalid MET forecast: unit for ${key} must be ${unit}`);
  }
}

export function parseMetForecast(payload: unknown): WeatherForecast {
  const root = record(payload, 'payload');
  if (root.type !== 'Feature') throw new TypeError('Invalid MET forecast: type must be Feature');
  const geometry = record(root.geometry, 'geometry');
  if (geometry.type !== 'Point' || !Array.isArray(geometry.coordinates) || geometry.coordinates.length < 2 ||
      !geometry.coordinates.every((coordinate) => typeof coordinate === 'number' && Number.isFinite(coordinate))) {
    throw new TypeError('Invalid MET forecast: geometry must contain finite Point coordinates');
  }
  const properties = record(root.properties, 'properties');
  const meta = record(properties.meta, 'properties.meta');
  assertUnits(meta);
  const updatedAt = meta.updated_at;
  if (updatedAt !== undefined && (typeof updatedAt !== 'string' || !Number.isFinite(Date.parse(updatedAt)))) {
    throw new TypeError('Invalid MET forecast: properties.meta.updated_at must be an ISO timestamp');
  }
  if (!Array.isArray(properties.timeseries) || properties.timeseries.length === 0) {
    throw new TypeError('Invalid MET forecast: properties.timeseries must be a non-empty array');
  }

  const points = properties.timeseries.map((rawPoint, index): WeatherForecastPoint => {
    const path = `properties.timeseries[${index}]`;
    const point = record(rawPoint, path);
    if (typeof point.time !== 'string' || !Number.isFinite(Date.parse(point.time))) {
      throw new TypeError(`Invalid MET forecast: ${path}.time must be an ISO timestamp`);
    }
    const data = record(point.data, `${path}.data`);
    const instant = record(data.instant, `${path}.data.instant`);
    const details = record(instant.details, `${path}.data.instant.details`);
    return {
      time: point.time,
      timestamp: Date.parse(point.time),
      temperatureC: optionalFiniteNumber(details.air_temperature, `${path}.data.instant.details.air_temperature`),
      windSpeedMs: optionalFiniteNumber(details.wind_speed, `${path}.data.instant.details.wind_speed`),
      next1Hours: parseInterval(data.next_1_hours, `${path}.data.next_1_hours`),
      next6Hours: parseInterval(data.next_6_hours, `${path}.data.next_6_hours`),
      next12Hours: parseInterval(data.next_12_hours, `${path}.data.next_12_hours`),
    };
  }).sort((a, b) => a.timestamp - b.timestamp);

  for (let index = 1; index < points.length; index += 1) {
    if (points[index - 1].timestamp === points[index].timestamp) {
      throw new TypeError(`Invalid MET forecast: duplicate time ${points[index].time}`);
    }
  }
  return { updatedAt: typeof updatedAt === 'string' ? updatedAt : null, points };
}

const symbolPresentation: Record<string, { label: string; emoji: string }> = {
  clearsky: { label: 'Clear sky', emoji: '☀️' },
  fair: { label: 'Mostly clear', emoji: '🌤️' },
  partlycloudy: { label: 'Partly cloudy', emoji: '⛅' },
  cloudy: { label: 'Cloudy', emoji: '☁️' },
  fog: { label: 'Fog', emoji: '🌫️' },
  lightrainshowers: { label: 'Light rain showers', emoji: '🌦️' },
  rainshowers: { label: 'Rain showers', emoji: '🌧️' },
  heavyrainshowers: { label: 'Heavy rain showers', emoji: '🌧️' },
  lightrain: { label: 'Light rain', emoji: '🌦️' },
  rain: { label: 'Rain', emoji: '🌧️' },
  heavyrain: { label: 'Heavy rain', emoji: '🌧️' },
  lightsleetshowers: { label: 'Light sleet showers', emoji: '🌨️' },
  sleetshowers: { label: 'Sleet showers', emoji: '🌨️' },
  heavysleetshowers: { label: 'Heavy sleet showers', emoji: '🌨️' },
  lightsleet: { label: 'Light sleet', emoji: '🌨️' },
  sleet: { label: 'Sleet', emoji: '🌨️' },
  heavysleet: { label: 'Heavy sleet', emoji: '🌨️' },
  lightsnowshowers: { label: 'Light snow showers', emoji: '🌨️' },
  snowshowers: { label: 'Snow showers', emoji: '🌨️' },
  heavysnowshowers: { label: 'Heavy snow showers', emoji: '❄️' },
  lightsnow: { label: 'Light snow', emoji: '🌨️' },
  snow: { label: 'Snow', emoji: '❄️' },
  heavysnow: { label: 'Heavy snow', emoji: '❄️' },
};

export function formatWeatherSymbol(code: string | null): { label: string; emoji: string } | null {
  if (!code) return null;
  const base = code.replace(/_(day|night|polartwilight)$/, '');
  const withoutThunder = base.replace(/andthunder$/, '');
  const presentation = symbolPresentation[base] ?? symbolPresentation[withoutThunder];
  if (!presentation) return { label: 'Weather', emoji: '🌤️' };
  return base.endsWith('andthunder')
    ? { label: `${presentation.label} and thunder`, emoji: '⛈️' }
    : presentation;
}

const osloDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: OSLO_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
});
const osloTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: OSLO_TIME_ZONE, hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});
const osloDateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: OSLO_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});

export function getOsloDate(value: Date | number): string {
  const parts = osloDateFormatter.formatToParts(value);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

function addCalendarDays(date: string, count: number): string {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + count)).toISOString().slice(0, 10);
}

function osloStartOfDay(date: string): number {
  const [year, month, day] = date.split('-').map(Number);
  const target = Date.UTC(year, month - 1, day);
  let instant = target;
  for (let iteration = 0; iteration < 3; iteration += 1) {
    const parts = osloDateTimeFormatter.formatToParts(instant);
    const number = (type: Intl.DateTimeFormatPartTypes) =>
      Number(parts.find((part) => part.type === type)?.value);
    const representedAsUtc = Date.UTC(number('year'), number('month') - 1, number('day'), number('hour'), number('minute'));
    instant += target - representedAsUtc;
  }
  if (getOsloDate(instant) !== date || localMinutes(instant) !== 0) {
    throw new RangeError(`Could not resolve Oslo midnight for ${date}`);
  }
  return instant;
}

function localMinutes(timestamp: number): number {
  const [hour, minute] = osloTimeFormatter.format(new Date(timestamp)).split(':').map(Number);
  return hour * 60 + minute;
}

function symbolFor(point: WeatherForecastPoint): string | null {
  return point.next1Hours?.symbolCode ?? point.next6Hours?.symbolCode ?? point.next12Hours?.symbolCode ?? null;
}

function currentFrom(point: WeatherForecastPoint): CurrentWeather {
  const precipitation = point.next1Hours?.precipitationMm != null
    ? { amount: point.next1Hours.precipitationMm, hours: 1 as const, code: point.next1Hours.symbolCode }
    : point.next6Hours?.precipitationMm != null
      ? { amount: point.next6Hours.precipitationMm, hours: 6 as const, code: point.next6Hours.symbolCode }
      : { amount: null, hours: null, code: symbolFor(point) };
  const code = precipitation.code ?? symbolFor(point);
  const presentation = formatWeatherSymbol(code);
  return {
    time: point.time,
    temperatureC: point.temperatureC,
    windSpeedMs: point.windSpeedMs,
    precipitationMm: precipitation.amount,
    precipitationHours: precipitation.hours,
    symbolCode: code,
    symbolLabel: presentation?.label ?? null,
    symbolEmoji: presentation?.emoji ?? null,
  };
}

function dailyPrecipitation(points: readonly WeatherForecastPoint[], start: number, end: number): number | null {
  if (start >= end) return null;
  const byTime = new Map(points.map((point) => [point.timestamp, point]));
  let cursor = start;
  let total = 0;
  while (cursor < end) {
    const point = byTime.get(cursor);
    if (!point) return null;
    const selected = point.next1Hours?.precipitationMm != null
      ? { hours: 1, amount: point.next1Hours.precipitationMm }
      : point.next6Hours?.precipitationMm != null
        ? { hours: 6, amount: point.next6Hours.precipitationMm }
        : null;
    if (!selected) return null;
    const intervalEnd = cursor + selected.hours * 60 * 60 * 1000;
    // MET interval values cannot be split honestly across Oslo calendar days.
    if (intervalEnd > end) return null;
    total += selected.amount;
    cursor = intervalEnd;
  }
  return cursor === end ? Math.round(total * 10) / 10 : null;
}

export function buildWeatherView(forecast: WeatherForecast, now: Date = new Date()): WeatherView {
  if (!Number.isFinite(now.getTime())) throw new RangeError('now must be a valid date');
  const nowTime = now.getTime();
  const today = getOsloDate(now);
  const currentCandidate = forecast.points
    .filter((point) => getOsloDate(point.timestamp) === today && point.timestamp <= nowTime)
    .at(-1) ?? null;
  let currentPoint: WeatherForecastPoint | null = null;
  if (currentCandidate) {
    const candidateIndex = forecast.points.indexOf(currentCandidate);
    const nextTimestamp = forecast.points[candidateIndex + 1]?.timestamp ?? Infinity;
    const spacing = nextTimestamp - currentCandidate.timestamp;
    const maximumAge = spacing <= 60 * 60 * 1000 || currentCandidate.next1Hours
      ? 60 * 60 * 1000
      : spacing <= 6 * 60 * 60 * 1000 || currentCandidate.next6Hours
        ? 6 * 60 * 60 * 1000
        : 60 * 60 * 1000;
    const validUntil = Math.min(nextTimestamp, currentCandidate.timestamp + maximumAge);
    if (nowTime < validUntil) currentPoint = currentCandidate;
  }

  const days = Array.from({ length: 7 }, (_, index): WeatherDay => {
    const date = addCalendarDays(today, index);
    const dayStart = osloStartOfDay(date);
    const dayEnd = osloStartOfDay(addCalendarDays(date, 1));
    const allDayPoints = forecast.points.filter((point) => getOsloDate(point.timestamp) === date);
    const points = index === 0 ? allDayPoints.filter((point) => point.timestamp >= nowTime) : allDayPoints;
    const temperatures = points.flatMap((point) => point.temperatureC == null ? [] : [point.temperatureC]);
    const representative = points
      .filter((point) => symbolFor(point) !== null)
      .sort((a, b) => Math.abs(localMinutes(a.timestamp) - 12 * 60) - Math.abs(localMinutes(b.timestamp) - 12 * 60))[0];
    const code = representative ? symbolFor(representative) : null;
    const presentation = formatWeatherSymbol(code);
    return {
      date,
      isToday: index === 0,
      available: points.length > 0,
      temperatureScope: index === 0 ? 'remaining-today' : 'forecast-temperatures',
      highC: temperatures.length > 0 ? Math.max(...temperatures) : null,
      lowC: temperatures.length > 0 ? Math.min(...temperatures) : null,
      precipitationMm: index === 0
        ? (points[0] ? dailyPrecipitation(allDayPoints, points[0].timestamp, dayEnd) : null)
        : dailyPrecipitation(allDayPoints, dayStart, dayEnd),
      symbolCode: code,
      symbolLabel: presentation?.label ?? null,
      symbolEmoji: presentation?.emoji ?? null,
    };
  });
  return { current: currentPoint ? currentFrom(currentPoint) : null, days };
}
