import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { buildWeatherView, formatWeatherSymbol, getOsloDate, parseMetForecast } from '../src/data/weather';

type PointOptions = {
  temperature?: number;
  wind?: number;
  one?: { precipitation?: number; symbol?: string };
  six?: { precipitation?: number; symbol?: string };
  twelve?: { precipitation?: number; symbol?: string };
};

function point(time: string, options: PointOptions = {}) {
  const interval = (value: PointOptions['one']) => value && ({
    summary: value.symbol === undefined ? {} : { symbol_code: value.symbol },
    details: value.precipitation === undefined ? {} : { precipitation_amount: value.precipitation },
  });
  return {
    time,
    data: {
      instant: { details: {
        ...(options.temperature === undefined ? {} : { air_temperature: options.temperature }),
        ...(options.wind === undefined ? {} : { wind_speed: options.wind }),
      } },
      ...(options.one ? { next_1_hours: interval(options.one) } : {}),
      ...(options.six ? { next_6_hours: interval(options.six) } : {}),
      ...(options.twelve ? { next_12_hours: interval(options.twelve) } : {}),
    },
  };
}

function payload(points: ReturnType<typeof point>[]) {
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [10.7522, 59.9139, 20] },
    properties: {
      meta: { updated_at: '2026-09-13T20:00:00Z', units: {
        air_temperature: 'celsius', wind_speed: 'm/s', precipitation_amount: 'mm',
      } },
      timeseries: points,
    },
  };
}

describe('MET compact forecast parsing', () => {
  test('normalizes Celsius, wind, precipitation periods and absent values without inventing them', () => {
    const forecast = parseMetForecast(payload([
      point('2026-09-13T22:00:00Z', {
        temperature: 12.5, wind: 3.2,
        one: { precipitation: 0.4, symbol: 'rainshowers_night' },
        six: { precipitation: 1.8, symbol: 'rain_day' },
      }),
      point('2026-09-13T23:00:00Z'),
    ]));
    assert.equal(forecast.points[0].temperatureC, 12.5);
    assert.equal(forecast.points[0].windSpeedMs, 3.2);
    assert.deepEqual(forecast.points[0].next1Hours, { precipitationMm: 0.4, symbolCode: 'rainshowers_night' });
    assert.equal(forecast.points[1].temperatureC, null);
    assert.equal(forecast.points[1].windSpeedMs, null);
    assert.equal(forecast.points[1].next1Hours, null);
  });

  test('rejects malformed payloads, wrong units, invalid values and duplicate forecast times', () => {
    assert.throws(() => parseMetForecast(null), /payload must be an object/);
    assert.throws(() => parseMetForecast({ ...payload([point('2026-09-13T22:00:00Z')]), type: 'Collection' }), /type must be Feature/);
    const wrongUnits = payload([point('2026-09-13T22:00:00Z')]);
    wrongUnits.properties.meta.units.wind_speed = 'km/h';
    assert.throws(() => parseMetForecast(wrongUnits), /wind_speed must be m\/s/);
    assert.throws(() => parseMetForecast(payload([point('invalid')])), /time must be an ISO timestamp/);
    assert.throws(() => parseMetForecast(payload([point('2026-09-13T22:00:00Z', { temperature: NaN })])), /finite number/);
    assert.throws(() => parseMetForecast(payload([
      point('2026-09-13T22:00:00Z'), point('2026-09-13T22:00:00Z'),
    ])), /duplicate time/);
  });
});

describe('Oslo weather view', () => {
  test('uses Oslo calendar dates across UTC day and daylight-saving boundaries', () => {
    assert.equal(getOsloDate(new Date('2026-09-13T22:00:00Z')), '2026-09-14');
    assert.equal(getOsloDate(new Date('2026-10-24T22:30:00Z')), '2026-10-25');
    assert.equal(getOsloDate(new Date('2026-10-25T23:30:00Z')), '2026-10-26');
    const view = buildWeatherView(parseMetForecast(payload([
      point('2026-10-24T22:00:00Z', { temperature: 4, six: { symbol: 'fog' } }),
    ])), new Date('2026-10-24T22:00:00Z'));
    assert.deepEqual(view.days.map((day) => day.date), [
      '2026-10-25', '2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31',
    ]);
  });

  test('uses the current containing slot and labels its precipitation window', () => {
    const view = buildWeatherView(parseMetForecast(payload([
      point('2026-09-14T08:00:00Z', { temperature: 10, one: { precipitation: 0.1, symbol: 'fair_day' } }),
      point('2026-09-14T09:00:00Z', { temperature: 11, one: { precipitation: 0.3, symbol: 'rainshowers_day' } }),
      point('2026-09-14T10:00:00Z', { temperature: 12, six: { precipitation: 2.5, symbol: 'rain_day' } }),
    ])), new Date('2026-09-14T08:40:00Z'));
    assert.equal(view.current?.time, '2026-09-14T08:00:00Z');
    assert.equal(view.current?.temperatureC, 10);
    assert.equal(view.current?.precipitationMm, 0.1);
    assert.equal(view.current?.precipitationHours, 1);
    assert.equal(view.current?.symbolLabel, 'Mostly clear');
  });

  test("today's range only covers remaining slots while future ranges use all available forecast samples", () => {
    const view = buildWeatherView(parseMetForecast(payload([
      point('2026-09-14T06:00:00Z', { temperature: 2 }),
      point('2026-09-14T10:00:00Z', { temperature: 9, six: { symbol: 'partlycloudy_day' } }),
      point('2026-09-14T16:00:00Z', { temperature: 5 }),
      point('2026-09-15T04:00:00Z', { temperature: 3 }),
      point('2026-09-15T10:00:00Z', { temperature: 13, six: { symbol: 'clearsky_day' } }),
      point('2026-09-15T16:00:00Z', { temperature: 7 }),
    ])), new Date('2026-09-14T09:00:00Z'));
    assert.deepEqual({ low: view.days[0].lowC, high: view.days[0].highC, scope: view.days[0].temperatureScope },
      { low: 5, high: 9, scope: 'remaining-today' });
    assert.deepEqual({ low: view.days[1].lowC, high: view.days[1].highC, scope: view.days[1].temperatureScope },
      { low: 3, high: 13, scope: 'forecast-temperatures' });
    assert.equal(view.days[1].symbolCode, 'clearsky_day');
    assert.equal(view.days[1].symbolEmoji, '☀️');
  });

  test('sums complete future hours for today without double-counting overlapping six-hour values', () => {
    const points = Array.from({ length: 24 }, (_, hour) =>
      point(new Date(Date.UTC(2026, 8, 13, 22 + hour)).toISOString(), {
        one: { precipitation: 0.1 }, six: { precipitation: 8 },
      }));
    const view = buildWeatherView(parseMetForecast(payload(points)), new Date('2026-09-13T22:30:00Z'));
    // The 22:00Z interval is already underway. Only the 23 whole future hours are counted.
    assert.equal(view.days[0].precipitationMm, 2.3);
  });

  test('sums a complete future Oslo day from contiguous six-hour windows', () => {
    const view = buildWeatherView(parseMetForecast(payload([
      point('2026-09-13T22:00:00Z'),
      point('2026-09-14T22:00:00Z', { six: { precipitation: 1 } }),
      point('2026-09-15T04:00:00Z', { six: { precipitation: 2 } }),
      point('2026-09-15T10:00:00Z', { six: { precipitation: 3 } }),
      point('2026-09-15T16:00:00Z', { six: { precipitation: 4 } }),
    ])), new Date('2026-09-13T22:00:00Z'));
    assert.equal(view.days[1].date, '2026-09-15');
    assert.equal(view.days[1].precipitationMm, 10);
  });

  test('withholds daily precipitation for cross-midnight aggregates and partial coverage', () => {
    const view = buildWeatherView(parseMetForecast(payload([
      point('2026-09-14T18:00:00Z', { six: { precipitation: 6 } }), // 20:00–02:00 Oslo
      point('2026-09-14T22:00:00Z', { six: { precipitation: 1 } }),
      point('2026-09-15T04:00:00Z', { six: { precipitation: 2 } }),
      point('2026-09-15T10:00:00Z', { six: { precipitation: 3 } }), // missing final six hours
    ])), new Date('2026-09-14T17:30:00Z'));
    assert.equal(view.days[0].precipitationMm, null);
    assert.equal(view.days[1].precipitationMm, null);
  });

  test('always returns seven days and keeps partial or absent fields explicitly unavailable', () => {
    const view = buildWeatherView(parseMetForecast(payload([
      point('2026-09-14T10:00:00Z', { six: { symbol: 'new_weather_code_day' } }),
    ])), new Date('2026-09-14T08:00:00Z'));
    assert.equal(view.days.length, 7);
    assert.equal(view.days[0].available, true);
    assert.equal(view.days[0].highC, null);
    assert.equal(view.days[0].precipitationMm, null);
    assert.equal(view.days[0].symbolLabel, 'Weather');
    assert.ok(view.days.slice(1).every((day) => day.available === false && day.highC === null));
    assert.deepEqual(formatWeatherSymbol('heavyrainandthunder_day'), { label: 'Heavy rain and thunder', emoji: '⛈️' });
  });

  test('does not present an out-of-date forecast day as current weather', () => {
    const view = buildWeatherView(parseMetForecast(payload([
      point('2026-09-13T10:00:00Z', { temperature: 18, one: { symbol: 'clearsky_day' } }),
    ])), new Date('2026-09-14T10:00:00Z'));
    assert.equal(view.current, null);
    assert.ok(view.days.every((day) => day.available === false));
  });

  test('bounds current samples by hourly or sparse six-hour forecast windows', () => {
    const hourlyOld = buildWeatherView(parseMetForecast(payload([
      point('2026-09-14T08:00:00Z', { temperature: 10, one: { precipitation: 0.2 } }),
    ])), new Date('2026-09-14T09:00:00Z'));
    assert.equal(hourlyOld.current, null);

    const sparseCurrent = buildWeatherView(parseMetForecast(payload([
      point('2026-09-14T06:00:00Z', { temperature: 8, six: { precipitation: 1 } }),
      point('2026-09-14T12:00:00Z', { temperature: 12, six: { precipitation: 0 } }),
    ])), new Date('2026-09-14T11:59:00Z'));
    assert.equal(sparseCurrent.current?.time, '2026-09-14T06:00:00Z');
    const sparseExpired = buildWeatherView(parseMetForecast(payload([
      point('2026-09-14T06:00:00Z', { temperature: 8, six: { precipitation: 1 } }),
    ])), new Date('2026-09-14T12:00:00Z'));
    assert.equal(sparseExpired.current, null);
  });
});
