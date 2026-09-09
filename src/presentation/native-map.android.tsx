import { GoogleMaps } from 'expo-maps';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useOffsiteTheme } from '@/theme';
import { MapUnavailable } from './map-unavailable';
import type { NativeMapProps } from './native-map.types';

export default function NativeMap({ latitude, longitude, title, approximate, androidConfigured }: NativeMapProps) {
  const [loaded, setLoaded] = useState(false);
  const [slow, setSlow] = useState(false);
  const { colors } = useOffsiteTheme();
  useEffect(() => {
    const timeout = setTimeout(() => setSlow(true), 15_000);
    return () => clearTimeout(timeout);
  }, []);
  if (!androidConfigured) return <MapUnavailable />;
  const coordinates = { latitude, longitude };
  return <View style={{ flex: 1 }}>
    <GoogleMaps.View style={{ flex: 1 }} cameraPosition={{ coordinates, zoom: approximate ? 14 : 16 }}
      markers={[{ id: 'destination', coordinates, title }]} onMapLoaded={() => setLoaded(true)}
      uiSettings={{ myLocationButtonEnabled: false, compassEnabled: true, mapToolbarEnabled: false }} />
    {slow && !loaded ? <View style={{ position: 'absolute', top: 12, left: 12, right: 12, padding: 12, borderRadius: 12, backgroundColor: colors.surface }}>
      <Text style={{ color: colors.text }}>Map hasn’t loaded. You can still open this location in your Maps app below.</Text>
    </View> : null}
  </View>;
}
