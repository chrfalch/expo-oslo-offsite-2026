import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ExpoConfig } from 'expo/config';
import configure from '../app.config';

const base: ExpoConfig = {
  name: 'Oslo Offsite',
  slug: 'oslo-offsite-2026',
  version: '1.0.0',
  runtimeVersion: { policy: 'appVersion' },
  android: { package: 'com.chrfalch.oslooffsite2026' },
  ios: { bundleIdentifier: 'com.chrfalch.oslooffsite2026' },
  extra: { eas: { projectId: 'offsite-project' } },
};

function resolveConfig(key: string | undefined, config = base) {
  const previous = process.env.GOOGLE_MAPS_API_KEY;
  if (key === undefined) delete process.env.GOOGLE_MAPS_API_KEY;
  else process.env.GOOGLE_MAPS_API_KEY = key;
  try {
    return configure({ config, projectRoot: process.cwd(), staticConfigPath: null, packageJsonPath: null });
  } finally {
    if (previous === undefined) delete process.env.GOOGLE_MAPS_API_KEY;
    else process.env.GOOGLE_MAPS_API_KEY = previous;
  }
}

test('Android Maps builds isolate updates without changing the iOS runtime', () => {
  const configured = resolveConfig('  test-android-key  ');
  assert.equal(configured.android?.config?.googleMaps?.apiKey, 'test-android-key');
  assert.equal(configured.android?.runtimeVersion, '1.0.0-android-maps-v1');
  assert.deepEqual(configured.runtimeVersion, base.runtimeVersion);
  assert.deepEqual(configured.ios, base.ios);
  assert.equal(configured.android?.package, base.android?.package);
  assert.deepEqual(configured.extra, { ...base.extra, androidMapsConfigured: true });
  assert.equal(JSON.stringify(configured.extra).includes('test-android-key'), false);

  const nextVersion = resolveConfig('test-android-key', { ...base, version: '1.0.1' });
  assert.notEqual(nextVersion.android?.runtimeVersion, configured.android?.runtimeVersion);
});

test('missing or empty keys preserve the safe fallback and original update runtime', () => {
  for (const key of [undefined, '', '   ']) {
    const configured = resolveConfig(key);
    assert.equal(configured.extra?.androidMapsConfigured, false);
    assert.equal(configured.android?.config?.googleMaps?.apiKey, undefined);
    assert.equal(configured.android?.runtimeVersion, undefined);
    assert.deepEqual(configured.runtimeVersion, base.runtimeVersion);
  }
});

test('an existing native Maps key is recognized when no environment override is supplied', () => {
  const config = {
    ...base,
    android: { ...base.android, config: { googleMaps: { apiKey: 'existing-key' } } },
  };
  assert.equal(resolveConfig(undefined, config).extra?.androidMapsConfigured, true);
  assert.equal(resolveConfig('override-key', config).android?.config?.googleMaps?.apiKey, 'override-key');
});
