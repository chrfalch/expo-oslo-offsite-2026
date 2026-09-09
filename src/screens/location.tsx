import Constants from 'expo-constants';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, Platform } from 'react-native';
import { getLocation, mapsUrls } from '@/data/locations';
import { ContentPageView } from '@/presentation/content-page-view';
import { LocationView } from '@/presentation/location-view';
import NativeMap from '@/presentation/native-map';
import { useOffsiteNavigation } from '@/screens/navigation';

export default function LocationScreen() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const place = getLocation(key);
  const { location, router } = useOffsiteNavigation();
  const [error, setError] = useState<string>();
  if (!place) return <ContentPageView sections={[{ id: 'location-missing', title: 'Location not found', rows: [{ id: 'guide', title: 'Open Oslo guide', onPress: () => router.replace('/oslo') }] }]} />;
  const urls = mapsUrls(place, Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web');
  async function open() {
    setError(undefined);
    for (const url of urls) {
      try { await Linking.openURL(url); return; } catch { /* Try the browser fallback if no native Maps app can open this URL. */ }
    }
    setError('Could not open Maps. Please try again. The location details are still shown here.');
  }
  const c = place.coordinates;
  return <LocationView key={key} title={place.title} address={place.address ?? 'Address not provided'} notice={place.notice}
    accuracy={c ? `${place.key === 'area:torshov' ? 'Approximate area reference' : c.precision === 'street' ? 'Street-level location' : 'Address-level location'} · Source: Kartverket\n${c.lat}, ${c.lng}` : undefined}
    map={c ? <NativeMap latitude={c.lat} longitude={c.lng} title={place.title} approximate={place.key === 'area:torshov' || c.precision === 'street'} androidConfigured={Constants.expoConfig?.extra?.androidMapsConfigured === true} /> : undefined}
    openLabel={`${c ? 'Open' : 'Search'} in ${Platform.OS === 'ios' ? 'Apple Maps' : Platform.OS === 'android' ? 'Google Maps' : 'Maps'}`}
    onOpenMaps={urls.length ? () => { void open(); } : undefined}
    onOpenArea={place.areaKey ? () => location(place.areaKey!) : undefined} error={error} />;
}
