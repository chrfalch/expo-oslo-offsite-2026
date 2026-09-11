import { buildWeatherView, parseMetForecast, type WeatherForecast, type WeatherView } from './weather';

export type WeatherStorage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
};

export type WeatherFetchResponse = {
  ok: boolean;
  status: number;
  headers: { get(name: string): string | null };
  json(): Promise<unknown>;
};

export type WeatherFetch = (
  endpoint: string,
  options: { headers: Record<string, string>; signal: AbortSignal },
) => Promise<WeatherFetchResponse>;

export type WeatherClientOptions = {
  endpoint: string;
  storage: WeatherStorage;
  fetch?: WeatherFetch;
  now?: () => Date;
  timeoutMs?: number;
  cacheTtlMs?: number;
  cacheKey?: string;
};

export type WeatherClientSource = 'network' | 'cache' | 'not-modified' | 'offline-cache';

export type WeatherClientResult = {
  forecast: WeatherForecast;
  view: WeatherView;
  source: WeatherClientSource;
  stale: boolean;
  fetchedAt: string;
  expiresAt: string;
};

export type GetWeatherOptions = { forceRefresh?: boolean };

export type WeatherClient = {
  getCachedForecast(): Promise<WeatherClientResult | null>;
  getForecast(options?: GetWeatherOptions): Promise<WeatherClientResult>;
};

type CacheEntry = {
  version: 1;
  forecast: WeatherForecast;
  fetchedAt: string;
  expiresAt: string;
  lastModified: string | null;
};

const DEFAULT_CACHE_KEY = 'oslo-weather-v1';
const DEFAULT_TTL_MS = 30 * 60 * 1000;
const DEFAULT_TIMEOUT_MS = 12_000;

function validIsoDate(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

function readNumber(value: unknown): number | null {
  return value === null || (typeof value === 'number' && Number.isFinite(value)) ? value : null;
}

function validateCachedForecast(value: unknown): WeatherForecast | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<WeatherForecast>;
  if (candidate.updatedAt !== null && !validIsoDate(candidate.updatedAt)) return null;
  if (!Array.isArray(candidate.points) || candidate.points.length === 0) return null;
  const points = candidate.points.map((point) => {
    if (!point || typeof point !== 'object' || !validIsoDate(point.time) || point.timestamp !== Date.parse(point.time) ||
        readNumber(point.temperatureC) !== point.temperatureC || readNumber(point.windSpeedMs) !== point.windSpeedMs) return null;
    const intervals = [point.next1Hours, point.next6Hours, point.next12Hours] as const;
    for (const interval of intervals) {
      if (interval === null) continue;
      if (!interval || typeof interval !== 'object' || readNumber(interval.precipitationMm) !== interval.precipitationMm ||
          !(interval.symbolCode === null || (typeof interval.symbolCode === 'string' && interval.symbolCode.length > 0))) return null;
    }
    return point;
  });
  if (points.some((point) => point === null)) return null;
  for (let index = 1; index < points.length; index += 1) {
    if (points[index - 1]!.timestamp >= points[index]!.timestamp) return null;
  }
  return { updatedAt: candidate.updatedAt, points: points as WeatherForecast['points'] };
}

function parseCache(serialized: string | null): CacheEntry | null {
  if (!serialized) return null;
  try {
    const value = JSON.parse(serialized) as Partial<CacheEntry>;
    if (value.version !== 1 || !validIsoDate(value.fetchedAt) || !validIsoDate(value.expiresAt) ||
        !(value.lastModified === null || typeof value.lastModified === 'string')) return null;
    const forecast = validateCachedForecast(value.forecast);
    return forecast ? { version: 1, forecast, fetchedAt: value.fetchedAt, expiresAt: value.expiresAt,
      lastModified: value.lastModified } : null;
  } catch {
    return null;
  }
}

function expiryFrom(response: WeatherFetchResponse, nowMs: number, fallbackTtlMs: number): string {
  const cacheControl = response.headers.get('cache-control');
  const maxAge = cacheControl?.match(/(?:^|,)\s*max-age=(\d+)/i)?.[1];
  const ageHeader = response.headers.get('age');
  const age = ageHeader != null && /^\d+$/.test(ageHeader.trim()) ? Number(ageHeader) : 0;
  if (maxAge) return new Date(nowMs + Math.max(0, Number(maxAge) - age) * 1000).toISOString();
  const expires = response.headers.get('expires');
  if (expires && Number.isFinite(Date.parse(expires))) return new Date(expires).toISOString();
  return new Date(nowMs + fallbackTtlMs).toISOString();
}

export function createWeatherClient(options: WeatherClientOptions): WeatherClient {
  if (!options.endpoint.trim()) throw new TypeError('Weather endpoint must not be empty');
  const fetcher = options.fetch ?? (globalThis.fetch as unknown as WeatherFetch);
  if (typeof fetcher !== 'function') throw new TypeError('A fetch implementation is required');
  const now = options.now ?? (() => new Date());
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const cacheTtlMs = options.cacheTtlMs ?? DEFAULT_TTL_MS;
  const cacheKey = options.cacheKey ?? DEFAULT_CACHE_KEY;
  if (!(timeoutMs > 0) || !(cacheTtlMs > 0)) throw new RangeError('Weather timeout and cache TTL must be positive');
  let refreshPromise: Promise<WeatherClientResult> | null = null;
  let memoryCache: CacheEntry | null = null;

  const cache = async () => {
    if (memoryCache) return memoryCache;
    try {
      memoryCache = parseCache(await options.storage.getItem(cacheKey));
      return memoryCache;
    } catch {
      return null;
    }
  };
  const writeCache = async (entry: CacheEntry) => {
    memoryCache = entry;
    try {
      await options.storage.setItem(cacheKey, JSON.stringify(entry));
    } catch {
      // Persistence is best-effort. A valid live response remains useful to the caller.
    }
  };
  const result = (entry: CacheEntry, source: WeatherClientSource, stale: boolean): WeatherClientResult => ({
    forecast: entry.forecast,
    view: buildWeatherView(entry.forecast, now()),
    source,
    stale,
    fetchedAt: entry.fetchedAt,
    expiresAt: entry.expiresAt,
  });

  async function refresh(existing: CacheEntry | null): Promise<WeatherClientResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (existing?.lastModified) headers['If-Modified-Since'] = existing.lastModified;
      const response = await fetcher(options.endpoint, { headers, signal: controller.signal });
      const fetchedAtMs = now().getTime();
      if (!Number.isFinite(fetchedAtMs)) throw new RangeError('now() must return a valid date');
      if (response.status === 304) {
        if (!existing) throw new Error('Weather endpoint returned 304 without a cached forecast');
        const updated: CacheEntry = {
          ...existing,
          fetchedAt: new Date(fetchedAtMs).toISOString(),
          expiresAt: expiryFrom(response, fetchedAtMs, cacheTtlMs),
          lastModified: response.headers.get('last-modified') ?? existing.lastModified,
        };
        await writeCache(updated);
        return result(updated, 'not-modified', Date.parse(updated.expiresAt) <= fetchedAtMs);
      }
      if (!response.ok) throw new Error(`Weather request failed with HTTP ${response.status}`);
      const forecast = parseMetForecast(await response.json());
      const entry: CacheEntry = {
        version: 1,
        forecast,
        fetchedAt: new Date(fetchedAtMs).toISOString(),
        expiresAt: expiryFrom(response, fetchedAtMs, cacheTtlMs),
        lastModified: response.headers.get('last-modified'),
      };
      await writeCache(entry);
      return result(entry, 'network', Date.parse(entry.expiresAt) <= fetchedAtMs);
    } catch (error) {
      if (existing) return result(existing, 'offline-cache', true);
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  return {
    async getCachedForecast() {
      const entry = await cache();
      if (!entry) return null;
      return result(entry, 'cache', Date.parse(entry.expiresAt) <= now().getTime());
    },
    async getForecast(_options: GetWeatherOptions = {}) {
      const existing = await cache();
      // The proxy controls freshness. Even an explicit refresh must not bypass its
      // Expires/max-age contract and create duplicate upstream MET requests.
      if (existing && Date.parse(existing.expiresAt) > now().getTime()) {
        return result(existing, 'cache', false);
      }
      if (!refreshPromise) refreshPromise = refresh(existing).finally(() => { refreshPromise = null; });
      return refreshPromise;
    },
  };
}
