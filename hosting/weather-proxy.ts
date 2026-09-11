import { parseMetForecast } from '../src/data/weather';

export const OSLO_FORECAST_URL = 'https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=59.9139&lon=10.7522';
const USER_AGENT = 'OsloOffsite2026/1.0 https://oslo-offsite-2026.expo.app/';
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'If-Modified-Since',
  'Access-Control-Expose-Headers': 'Expires, Last-Modified, Age',
};
type Cached = { body: string; expires: string; modified: string | null };
type EdgeCache = { match(key: string): Promise<Response | undefined>; put(key: string, response: Response): Promise<void> };

/** One fixed, public Oslo forecast. No caller-supplied URL, coordinates or identity. */
export function createWeatherProxy({ fetcher = fetch, now = Date.now, cache }: {
  fetcher?: typeof fetch; now?: () => number; cache?: EdgeCache;
} = {}) {
  let stored: Cached | undefined;
  let pending: Promise<Cached> | undefined;
  let retryAfter = 0;
  const cacheKey = 'https://oslo-offsite-2026.expo.app/api/weather';

  async function load(): Promise<Cached> {
    if (stored && Date.parse(stored.expires) > now()) return stored;
    if (cache) {
      const hit = await cache.match(cacheKey).catch(() => undefined);
      if (hit && Date.parse(hit.headers.get('Expires') ?? '') > now()) {
        const body = await hit.text();
        parseMetForecast(JSON.parse(body));
        stored = { body, expires: hit.headers.get('Expires')!, modified: hit.headers.get('Last-Modified') };
        return stored;
      }
    }
    if (now() < retryAfter) throw new Error('Weather temporarily unavailable');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
      const response = await fetcher(OSLO_FORECAST_URL, {
        signal: controller.signal,
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/json', ...(stored?.modified ? { 'If-Modified-Since': stored.modified } : {}) },
      });
      if (response.status !== 304 && !response.ok) throw new Error(`Weather upstream: ${response.status}`);
      const rawExpiry = response.headers.get('Expires');
      const expires = rawExpiry && Number.isFinite(Date.parse(rawExpiry)) ? rawExpiry : new Date(now() + 30 * 60_000).toUTCString();
      if (response.status === 304) {
        if (!stored) throw new Error('No cached forecast');
        stored = { ...stored, expires };
      } else {
        const body = await response.text();
        parseMetForecast(JSON.parse(body));
        stored = { body, expires, modified: response.headers.get('Last-Modified') };
      }
      if (cache) await cache.put(cacheKey, makeResponse(stored)).catch(() => {});
      return stored;
    } catch (error) {
      retryAfter = now() + 60_000;
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  function makeResponse(value: Cached, request?: Request) {
    const headers = {
      ...cors,
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=${Math.max(0, Math.floor((Date.parse(value.expires) - now()) / 1000))}`,
      Expires: value.expires,
      ...(value.modified ? { 'Last-Modified': value.modified } : {}),
    };
    const unchanged = value.modified && request?.headers.get('If-Modified-Since') === value.modified;
    return new Response(unchanged ? null : value.body, { status: unchanged ? 304 : 200, headers });
  }

  return async (request: Request): Promise<Response> => {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'GET') return new Response(null, { status: 405, headers: { ...cors, Allow: 'GET, OPTIONS' } });
    try {
      pending ??= load().finally(() => { pending = undefined; });
      return makeResponse(await pending, request);
    } catch {
      return Response.json({ error: 'Weather temporarily unavailable' }, {
        status: 503, headers: { ...cors, 'Cache-Control': 'no-store', 'Retry-After': '60' },
      });
    }
  };
}

// Cloudflare's edge cache is optional so the same handler works in local Expo/Node.
const edgeCache = (globalThis as unknown as { caches?: { default?: EdgeCache } }).caches?.default;
export const weatherProxy = createWeatherProxy({ cache: edgeCache });
