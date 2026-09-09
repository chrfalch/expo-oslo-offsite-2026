import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const mapsKey = process.env.GOOGLE_MAPS_API_KEY?.trim();
  return {
    ...config,
    name: config.name ?? 'Oslo Offsite',
    slug: config.slug ?? 'oslo-offsite-2026',
    android: { ...config.android, config: { ...config.android?.config,
      ...(mapsKey ? { googleMaps: { apiKey: mapsKey } } : {}) } },
    extra: { ...config.extra, androidMapsConfigured: Boolean(mapsKey) },
  };
};
