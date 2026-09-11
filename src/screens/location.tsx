import Constants from 'expo-constants';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, Platform } from 'react-native';
import { formatLocationAccuracy, getLocation, isApproximateLocation, mapsUrls } from '@/data/locations';
import { getAccommodationPhotos, getGuideImage } from '@/media/guide-images';
import { ContentPageView } from '@/presentation/content-page-view';
import { LocationSheet, LocationView } from '@/presentation/location-view';
import NativeMap from '@/presentation/native-map';
import { useOffsiteNavigation } from '@/screens/navigation';
import { useScreenObserve } from '@/screens/use-screen-observe';

export default function LocationScreen() {
  useScreenObserve();
  const { key } = useLocalSearchParams<{ key: string }>();
  const place = getLocation(key);
  const { router } = useOffsiteNavigation();
  const [error, setError] = useState<string>();
  if (!place) return <LocationSheet><ContentPageView sections={[{ id: 'location-missing', title: 'Location not found', rows: [{ id: 'guide', title: 'Open Oslo guide', onPress: () => router.replace('/oslo') }] }]} /></LocationSheet>;
  const urls = mapsUrls(place, Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web');
  async function open() {
    setError(undefined);
    for (const url of urls) {
      try { await Linking.openURL(url); return; } catch { /* Try the browser fallback if no native Maps app can open this URL. */ }
    }
    setError('Could not open Maps. Please try again. The location details are still shown here.');
  }
  const c = place.coordinates;
  const approximate = isApproximateLocation(place);
  const apartmentApproximation = key.startsWith('stay:') && c?.precision === 'approximate';
  return <LocationSheet><LocationView key={key} title={place.title} address={place.address ?? 'Exact address not provided'}
    notice={place.notice}
    image={getGuideImage(place.image, place.title)} photos={place.photos ? getAccommodationPhotos(place.photos) : undefined}
    websiteUrl={place.websiteUrl} websiteLabel={place.websiteLabel} description={place.description} details={place.details} residents={place.residents}
    accuracy={[formatLocationAccuracy(place), apartmentApproximation ? place.notice : undefined].filter(Boolean).join('\n\n') || undefined}
    map={c ? <NativeMap latitude={c.lat} longitude={c.lng} title={approximate ? `${place.title} (approximate)` : place.title} approximate={approximate} androidConfigured={Constants.expoConfig?.extra?.androidMapsConfigured === true} /> : undefined}
    openLabel={`${c ? 'Open' : 'Search'} in ${Platform.OS === 'ios' ? 'Apple Maps' : Platform.OS === 'android' ? 'Google Maps' : 'Maps'}`}
    onOpenMaps={urls.length ? () => { void open(); } : undefined}
    onOpenArea={place.areaKey ? () => router.setParams({ key: place.areaKey }) : undefined} error={error} /></LocationSheet>;
}
