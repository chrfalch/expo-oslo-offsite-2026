import { formatWeatherSymbol, getOsloDate, OSLO_TIME_ZONE, type WeatherForecast } from './weather';

const timeFormatter = new Intl.DateTimeFormat('en-GB', { timeZone: OSLO_TIME_ZONE, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

export function getWeatherHours(forecast: WeatherForecast, date: string, fromTimestamp = -Infinity) {
  return forecast.points.filter((point) => getOsloDate(point.timestamp) === date && point.timestamp >= fromTimestamp).map((point) => {
    const intervals = [[point.next1Hours, 1], [point.next6Hours, 6], [point.next12Hours, 12]] as const;
    const precipitation = intervals.find(([interval]) => interval?.precipitationMm != null);
    const symbol = formatWeatherSymbol(point.next1Hours?.symbolCode ?? point.next6Hours?.symbolCode ?? point.next12Hours?.symbolCode ?? null);
    return {
      id: point.time,
      time: timeFormatter.format(new Date(point.timestamp)),
      emoji: symbol?.emoji ?? '',
      temperature: point.temperatureC === null ? '—' : `${Math.round(point.temperatureC)}°`,
      condition: symbol?.label ?? 'Unavailable',
      wind: point.windSpeedMs === null ? 'Wind —' : `${Math.round(point.windSpeedMs)} m/s`,
      precipitation: precipitation ? `${precipitation[0]!.precipitationMm!.toFixed(1)} mm / ${precipitation[1]}h` : 'Precip. —',
    };
  });
}
