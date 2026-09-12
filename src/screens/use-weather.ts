import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { createWeatherClient, type WeatherClientResult } from '@/data/weather-client';
import { buildWeatherView, OSLO_TIME_ZONE } from '@/data/weather';
import { getWeatherHours } from '@/data/weather-hours';
import type { WeatherModel } from '@/presentation/weather-view';

const weatherClient = createWeatherClient({
  endpoint: process.env.EXPO_PUBLIC_WEATHER_URL?.trim() || 'https://oslo-offsite-2026--weather.expo.app/api/weather',
  storage: AsyncStorage,
});

const temperature = (value: number | null) => value === null ? '—' : `${Math.round(value)}°`;
const dateLabel = (date: string, options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-GB', { timeZone: OSLO_TIME_ZONE, ...options }).format(new Date(`${date}T12:00:00Z`));
const timeLabel = (timestamp: number) => new Intl.DateTimeFormat('en-GB', { timeZone: OSLO_TIME_ZONE, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(timestamp));

function toModel(result: WeatherClientResult | null, now: Date, loading: boolean, failed: boolean): WeatherModel {
  const view = result ? buildWeatherView(result.forecast, now) : null;
  const current = view?.current;
  const expired = result && (result.stale || Date.parse(result.expiresAt) <= now.getTime());
  const updated = result ? new Intl.DateTimeFormat('en-GB', { timeZone: OSLO_TIME_ZONE, day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(result.forecast.updatedAt ?? result.fetchedAt)) : '';
  return {
    loading: loading && !result,
    temperature: current?.temperatureC == null ? '' : temperature(current.temperatureC),
    emoji: current?.symbolEmoji ?? '',
    condition: current?.symbolLabel ?? (current ? 'Conditions unavailable' : loading ? 'Fetching the Oslo forecast' : 'Weather unavailable'),
    detail: current ? [current.windSpeedMs === null ? null : `Wind ${Math.round(current.windSpeedMs)} m/s`,
      current.precipitationMm === null || current.precipitationHours === null ? null : `${current.precipitationMm.toFixed(1)} mm, ${timeLabel(Date.parse(current.time))}–${timeLabel(Date.parse(current.time) + current.precipitationHours * 3_600_000)}`].filter(Boolean).join(' · ') : '',
    status: result ? `${expired || failed ? 'Saved forecast · ' : ''}Updated ${updated}${expired ? ' · may be out of date' : ''}` : failed ? 'Couldn’t load the forecast. Please try again.' : '',
    days: view?.days.map((day) => ({
      date: day.date,
      isToday: day.isToday,
      title: day.isToday ? 'Today' : dateLabel(day.date, { weekday: 'long' }),
      subtitle: `${dateLabel(day.date, { day: 'numeric', month: 'short' })}${day.isToday ? ' · Remaining hours' : ''}`,
      emoji: day.symbolEmoji ?? '',
      condition: day.available ? day.symbolLabel ?? 'Conditions unavailable' : 'Forecast unavailable',
      range: day.available ? `${temperature(day.lowC)} / ${temperature(day.highC)}` : '—',
      detail: day.precipitationMm === null ? '' : `${day.precipitationMm.toFixed(1)} mm precipitation${day.isToday ? ' remaining' : ''}`,
      hours: getWeatherHours(result!.forecast, day.date, day.isToday ? (current ? Date.parse(current.time) : now.getTime()) : -Infinity),
    })) ?? [],
  };
}

export function useWeather() {
  const [result, setResult] = useState<WeatherClientResult | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const activeRefresh = useRef<() => Promise<void>>(async () => {});

  useFocusEffect(useCallback(() => {
    let alive = true;
    let request: Promise<void> | undefined;
    function refresh() {
      if (!alive || AppState.currentState === 'background' || AppState.currentState === 'inactive') return Promise.resolve();
      request ??= (async () => {
        setNow(new Date());
        setLoading(true);
        try {
          const cached = await weatherClient.getCachedForecast();
          if (alive && cached) setResult(cached);
          const next = await weatherClient.getForecast();
          if (alive) { setResult(next); setFailed(next.source === 'offline-cache'); }
        } catch {
          if (alive) setFailed(true);
        } finally {
          if (alive) { setLoading(false); setNow(new Date()); }
        }
      })().finally(() => { request = undefined; });
      return request;
    }
    activeRefresh.current = refresh;
    void refresh();
    const subscription = AppState.addEventListener('change', (state) => { if (state === 'active') void refresh(); });
    const timer = setInterval(() => { void refresh(); }, 60_000);
    return () => {
      alive = false;
      if (activeRefresh.current === refresh) activeRefresh.current = async () => {};
      subscription.remove();
      clearInterval(timer);
    };
  }, []));

  const refresh = useCallback(() => activeRefresh.current(), []);
  return { weather: toModel(result, now, loading, failed), refresh };
}
