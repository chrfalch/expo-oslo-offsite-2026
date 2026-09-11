import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createWeatherClient, type WeatherFetchResponse, type WeatherStorage } from '../src/data/weather-client';

function payload(temperature = 10) {
  return {
    type: 'Feature', geometry: { type: 'Point', coordinates: [10.7522, 59.9139, 20] },
    properties: {
      meta: { updated_at: '2026-09-14T08:00:00Z', units: {
        air_temperature: 'celsius', wind_speed: 'm/s', precipitation_amount: 'mm',
      } },
      timeseries: [{ time: '2026-09-14T09:00:00Z', data: {
        instant: { details: { air_temperature: temperature, wind_speed: 3 } },
        next_1_hours: { summary: { symbol_code: 'fair_day' }, details: { precipitation_amount: 0 } },
      } }],
    },
  };
}

function response(status: number, body: unknown, headers: Record<string, string> = {}): WeatherFetchResponse {
  const normalized = Object.fromEntries(Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value]));
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (name) => normalized[name.toLowerCase()] ?? null },
    json: async () => body,
  };
}

function memoryStorage(initial: string | null = null) {
  let value = initial;
  const storage: WeatherStorage = {
    getItem: async () => value,
    setItem: async (_key, next) => { value = next; },
  };
  return { storage, read: () => value };
}

test('fetches the fixed proxy endpoint, validates data and hydrates a fresh cache without networking', async () => {
  const memory = memoryStorage();
  let calls = 0;
  let requestedEndpoint = '';
  const client = createWeatherClient({
    endpoint: 'https://example.test/api/weather', storage: memory.storage,
    now: () => new Date('2026-09-14T09:00:00Z'),
    fetch: async (endpoint) => {
      calls += 1;
      requestedEndpoint = endpoint;
      return response(200, payload(), { 'last-modified': 'Mon, 14 Sep 2026 08:00:00 GMT', 'cache-control': 'max-age=900', age: '60' });
    },
  });
  const network = await client.getForecast();
  assert.equal(requestedEndpoint, 'https://example.test/api/weather');
  assert.equal(network.source, 'network');
  assert.equal(network.expiresAt, '2026-09-14T09:14:00.000Z');
  assert.equal(network.view.current?.temperatureC, 10);
  const hydrated = await client.getCachedForecast();
  assert.equal(hydrated?.source, 'cache');
  assert.equal(hydrated?.stale, false);
  assert.equal((await client.getForecast()).source, 'cache');
  assert.equal((await client.getForecast({ forceRefresh: true })).source, 'cache');
  assert.equal(calls, 1);
  assert.ok(memory.read()?.includes('lastModified'));
});

test('refreshes expired data conditionally and renews the cache on 304', async () => {
  const memory = memoryStorage();
  let clock = new Date('2026-09-14T09:00:00Z');
  const first = createWeatherClient({
    endpoint: 'https://example.test/weather', storage: memory.storage, cacheTtlMs: 1_000,
    now: () => clock,
    fetch: async () => response(200, payload(), { 'last-modified': 'Mon, 14 Sep 2026 08:00:00 GMT' }),
  });
  await first.getForecast();
  clock = new Date('2026-09-14T09:00:02Z');
  let conditionalHeader: string | undefined;
  const second = createWeatherClient({
    endpoint: 'https://example.test/weather', storage: memory.storage, cacheTtlMs: 60_000,
    now: () => clock,
    fetch: async (_endpoint, options) => {
      conditionalHeader = options.headers['If-Modified-Since'];
      return response(304, null);
    },
  });
  assert.equal((await second.getCachedForecast())?.stale, true);
  const renewed = await second.getForecast();
  assert.equal(conditionalHeader, 'Mon, 14 Sep 2026 08:00:00 GMT');
  assert.equal(renewed.source, 'not-modified');
  assert.equal(renewed.stale, false);
  assert.equal(renewed.fetchedAt, '2026-09-14T09:00:02.000Z');
  assert.equal(renewed.expiresAt, '2026-09-14T09:01:02.000Z');
});

test('ignores corrupt caches and rejects malformed network payloads', async () => {
  const memory = memoryStorage('{"version":1,"forecast":"broken"}');
  let calls = 0;
  const client = createWeatherClient({
    endpoint: 'https://example.test/weather', storage: memory.storage,
    fetch: async () => { calls += 1; return response(200, { type: 'Feature' }); },
  });
  assert.equal(await client.getCachedForecast(), null);
  await assert.rejects(client.getForecast(), /geometry must be an object/);
  assert.equal(calls, 1);
});

test('falls back to expired cache on request failure and always flags the result stale', async () => {
  const memory = memoryStorage();
  let clock = new Date('2026-09-14T09:00:00Z');
  const seed = createWeatherClient({
    endpoint: 'https://example.test/weather', storage: memory.storage, cacheTtlMs: 1_000,
    now: () => clock, fetch: async () => response(200, payload(8)),
  });
  await seed.getForecast();
  clock = new Date('2026-09-14T09:01:00Z');
  const offline = createWeatherClient({
    endpoint: 'https://example.test/weather', storage: memory.storage, now: () => clock,
    fetch: async () => { throw new Error('offline'); },
  });
  const fallback = await offline.getForecast();
  assert.equal(fallback.source, 'offline-cache');
  assert.equal(fallback.stale, true);
  assert.equal(fallback.view.current?.temperatureC, 8);
});

test('honors absolute stale expiry and tolerates storage read and write failures', async () => {
  let calls = 0;
  const storage: WeatherStorage = {
    getItem: async () => { throw new Error('unavailable'); },
    setItem: async () => { throw new Error('full'); },
  };
  const client = createWeatherClient({
    endpoint: 'https://example.test/weather', storage,
    now: () => new Date('2026-09-14T09:00:00Z'),
    fetch: async () => {
      calls += 1;
      return response(200, payload(), { expires: 'Mon, 14 Sep 2026 08:59:00 GMT' });
    },
  });
  const result = await client.getForecast({ forceRefresh: true });
  assert.equal(result.source, 'network');
  assert.equal(result.stale, true);
  assert.equal(result.expiresAt, '2026-09-14T08:59:00.000Z');
  assert.equal(calls, 1);
});

test('retains a fresh validated response in memory when persistent cache writes fail', async () => {
  let calls = 0;
  const storage: WeatherStorage = {
    getItem: async () => null,
    setItem: async () => { throw new Error('full'); },
  };
  const client = createWeatherClient({
    endpoint: 'https://example.test/weather', storage,
    now: () => new Date('2026-09-14T09:00:00Z'),
    fetch: async () => { calls += 1; return response(200, payload(), { 'cache-control': 'max-age=300' }); },
  });
  assert.equal((await client.getForecast()).source, 'network');
  assert.equal((await client.getForecast()).source, 'cache');
  assert.equal((await client.getCachedForecast())?.source, 'cache');
  assert.equal(calls, 1);
});

test('deduplicates concurrent refreshes', async () => {
  const memory = memoryStorage();
  let calls = 0;
  let release: ((value: WeatherFetchResponse) => void) | undefined;
  const pending = new Promise<WeatherFetchResponse>((resolve) => { release = resolve; });
  const client = createWeatherClient({
    endpoint: 'https://example.test/weather', storage: memory.storage,
    fetch: async () => { calls += 1; return pending; },
  });
  const one = client.getForecast();
  const two = client.getForecast();
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(calls, 1);
  release?.(response(200, payload()));
  const [a, b] = await Promise.all([one, two]);
  assert.equal(a.fetchedAt, b.fetchedAt);
});

test('aborts a hung request after the configured timeout', async () => {
  const memory = memoryStorage();
  const client = createWeatherClient({
    endpoint: 'https://example.test/weather', storage: memory.storage, timeoutMs: 5,
    fetch: async (_endpoint, options) => new Promise((_resolve, reject) => {
      options.signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
    }),
  });
  await assert.rejects(client.getForecast(), /aborted/);
});
