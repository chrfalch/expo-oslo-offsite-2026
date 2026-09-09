import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const mapsKey = process.env.GOOGLE_MAPS_API_KEY?.trim()
    || config.android?.config?.googleMaps?.apiKey?.trim();
  return {
    ...config,
    name: config.name ?? 'Oslo Offsite',
    slug: config.slug ?? 'oslo-offsite-2026',
    android: {
      ...config.android,
      // Installing a Maps key changes the native binary. Keep updates for it away
      // from older Android installations whose manifests have no Google Maps key.
      ...(mapsKey ? { runtimeVersion: `${config.version ?? '1.0.0'}-android-maps-v1` } : {}),
      config: {
        ...config.android?.config,
        ...(mapsKey ? { googleMaps: { apiKey: mapsKey } } : {}),
      },
    },
    extra: { ...config.extra, androidMapsConfigured: Boolean(mapsKey) },
  };
};
