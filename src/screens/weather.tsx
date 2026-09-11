import { useState } from 'react';
import { Linking } from 'react-native';
import { WeatherView } from '@/presentation/weather-view';
import { useWeather } from '@/screens/use-weather';
import { useScreenObserve } from '@/screens/use-screen-observe';

export default function WeatherScreen() {
  useScreenObserve();
  const { weather, refresh } = useWeather();
  const [linkError, setLinkError] = useState<string>();
  async function open(url: string) {
    setLinkError(undefined);
    try { await Linking.openURL(url); }
    catch { setLinkError('Could not open the link. Please try again when connected.'); }
  }
  return <WeatherView weather={weather} onRetry={refresh} linkError={linkError}
    onSource={() => { void open('https://api.met.no/weatherapi/locationforecast/2.0/documentation'); }}
    onLicense={() => { void open('https://creativecommons.org/licenses/by/4.0/'); }} />;
}
