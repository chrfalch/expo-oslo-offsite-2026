import { AppleMaps } from 'expo-maps';
import type { NativeMapProps } from './native-map.types';

export default function NativeMap({ latitude, longitude, title, approximate }: NativeMapProps) {
  const coordinates = { latitude, longitude };
  return <AppleMaps.View style={{ flex: 1 }} cameraPosition={{ coordinates, zoom: approximate ? 14 : 16 }}
    markers={[{ id: 'destination', coordinates, title, systemImage: 'mappin' }]}
    uiSettings={{ myLocationButtonEnabled: false, compassEnabled: true, scaleBarEnabled: true }} />;
}
