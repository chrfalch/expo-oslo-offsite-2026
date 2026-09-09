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
    const { getLocation } = await import('../src/data/locations');
    for (const place of offsiteData.places) assert.deepEqual(getLocation(`place:${place.id}`)?.image, place.image);
    for (const event of offsiteData.schedule) assert.deepEqual(getLocation(`activity:${event.id}`)?.image, event.image);
    assert.deepEqual(getLocation('workspace:rebel')?.image, offsiteData.workspace.image);
    offsiteData.accommodation.options.forEach((flat, index) => {
      const location = getLocation(`stay:${index}`)!;
      assert.equal(location.address, flat.address);
      assert.deepEqual(location.photos, flat.photos);
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
