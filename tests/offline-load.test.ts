import assert from 'node:assert/strict';
import { test } from 'node:test';

test('loads every content section with networking disabled', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => { throw new Error('Network unavailable'); };
  try {
    const { offsiteData } = await import('../src/data/offsite');
    const { default: snapshot } = await import('../src/data/offsite-data.json');
    assert.deepEqual(offsiteData, snapshot);
    assert.ok(offsiteData.places.length > 0);
    assert.ok(offsiteData.travel.length > 0);
    assert.ok(offsiteData.accommodation.options.length > 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
