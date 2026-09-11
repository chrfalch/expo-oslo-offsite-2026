import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createWeatherProxy, OSLO_FORECAST_URL } from '../hosting/weather-proxy';

const fixture = { type: 'Feature', geometry: { type: 'Point', coordinates: [10.7522, 59.9139] }, properties: { meta: { updated_at: '2026-09-11T08:00:00Z', units: { air_temperature: 'celsius', wind_speed: 'm/s', precipitation_amount: 'mm' } }, timeseries: [
  { time: '2026-09-11T09:00:00Z', data: { instant: { details: { air_temperature: 14, wind_speed: 2 } }, next_1_hours: { summary: { symbol_code: 'cloudy' }, details: { precipitation_amount: 0 } } } },
] } };

test('proxy identifies itself, fixes Oslo coordinates, deduplicates and honours upstream expiry', async () => {
  let calls = 0;
  const proxy = createWeatherProxy({ now: () => Date.parse('2026-09-11T09:00:00Z'), fetcher: async (input, init) => {
    calls++;
    assert.equal(input, OSLO_FORECAST_URL);
    assert.match(new Headers(init?.headers).get('User-Agent')!, /OsloOffsite2026.*https:/);
    assert.equal(new Headers(init?.headers).get('Authorization'), null);
    return Response.json(fixture, { headers: { Expires: 'Fri, 11 Sep 2026 10:00:00 GMT', 'Last-Modified': 'Fri, 11 Sep 2026 08:00:00 GMT' } });
  } });
  const request = new Request('https://example.com/api/weather?url=https://example.com/private');
  const responses = await Promise.all([proxy(request), proxy(request)]);
  assert.equal(calls, 1);
  assert.equal(responses[0].status, 200);
  assert.equal(responses[0].headers.get('Access-Control-Allow-Origin'), '*');
  assert.equal((await proxy(request)).status, 200);
  assert.equal(calls, 1);
  assert.equal((await proxy(new Request(request, { headers: { 'If-Modified-Since': 'Fri, 11 Sep 2026 08:00:00 GMT' } }))).status, 304);
});

test('expired proxy cache uses conditional revalidation and retains its body on 304', async () => {
  let now = Date.parse('2026-09-11T09:00:00Z');
  let calls = 0;
  const proxy = createWeatherProxy({ now: () => now, fetcher: async (_input, init) => {
    calls++;
    if (calls === 1) return Response.json(fixture, { headers: { Expires: 'Fri, 11 Sep 2026 09:10:00 GMT', 'Last-Modified': 'Fri, 11 Sep 2026 08:00:00 GMT' } });
    assert.equal(new Headers(init?.headers).get('If-Modified-Since'), 'Fri, 11 Sep 2026 08:00:00 GMT');
    return new Response(null, { status: 304, headers: { Expires: 'Fri, 11 Sep 2026 10:00:00 GMT' } });
  } });
  const request = new Request('https://example.com/api/weather');
  await proxy(request);
  now += 11 * 60_000;
  assert.deepEqual(await (await proxy(request)).json(), fixture);
  assert.equal(calls, 2);
});

test('upstream errors are not cached as forecasts and retry traffic backs off', async () => {
  let calls = 0;
  const proxy = createWeatherProxy({ fetcher: async () => { calls++; return new Response('limited', { status: 429 }); } });
  const request = new Request('https://example.com/api/weather');
  assert.equal((await proxy(request)).status, 503);
  assert.equal((await proxy(request)).status, 503);
  assert.equal(calls, 1);
  assert.equal((await proxy(new Request(request, { method: 'OPTIONS' }))).status, 204);
});
