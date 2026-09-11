import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getWeatherHours } from '../src/data/weather-hours';
import type { WeatherForecastPoint } from '../src/data/weather';

function point(time: string, overrides: Partial<WeatherForecastPoint> = {}): WeatherForecastPoint {
  return { time, timestamp: Date.parse(time), temperatureC: 12, windSpeedMs: 2,
    next1Hours: null, next6Hours: null, next12Hours: null, ...overrides };
}

test('hourly details choose available symbol and precipitation independently', () => {
  const points = [point('2026-09-11T08:00:00Z', {
    next1Hours: { symbolCode: 'cloudy', precipitationMm: null },
    next6Hours: { symbolCode: 'rain', precipitationMm: 3.2 },
  }), point('2026-09-11T09:00:00Z', {
    next1Hours: { symbolCode: null, precipitationMm: 0 },
    next6Hours: { symbolCode: 'rain', precipitationMm: 3.2 },
  })];
  const hours = getWeatherHours({ points, updatedAt: null }, '2026-09-11');
  assert.equal(hours[0].condition, 'Cloudy');
  assert.equal(hours[0].precipitation, '3.2 mm / 6h');
  assert.equal(hours[1].condition, 'Rain');
  assert.equal(hours[1].precipitation, '0.0 mm / 1h');
});

test('repeated Oslo clock hours retain unique timestamp keys at autumn DST change', () => {
  const points = [point('2026-10-25T00:00:00Z'), point('2026-10-25T01:00:00Z')];
  const hours = getWeatherHours({ points, updatedAt: null }, '2026-10-25');
  assert.equal(hours[0].time, '02:00');
  assert.equal(hours[1].time, '02:00');
  assert.notEqual(hours[0].id, hours[1].id);
  assert.equal(hours[0].precipitation, 'Precip. —');
});

test('today detail filtering uses Oslo date and excludes elapsed forecast slots', () => {
  const points = ['2026-09-10T21:00:00Z', '2026-09-10T22:00:00Z', '2026-09-11T08:00:00Z', '2026-09-11T22:00:00Z'].map((time) => point(time));
  const hours = getWeatherHours({ points, updatedAt: null }, '2026-09-11', Date.parse('2026-09-11T08:00:00Z'));
  assert.deepEqual(hours.map((hour) => hour.time), ['10:00']);
});
