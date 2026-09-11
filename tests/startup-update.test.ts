import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createStartupUpdateCoordinator } from '../src/updates/startup-update';

test('checks and downloads an available update only once', async () => {
  const coordinator = createStartupUpdateCoordinator();
  let checks = 0;
  let downloads = 0;
  const api = {
    checkForUpdateAsync: async () => {
      checks += 1;
      return { isAvailable: true };
    },
    fetchUpdateAsync: async () => {
      downloads += 1;
      return { isNew: true };
    },
  };

  const results = await Promise.all([
    coordinator.checkAndDownload(api),
    coordinator.checkAndDownload(api),
  ]);

  assert.deepEqual(results, [true, true]);
  assert.equal(checks, 1);
  assert.equal(downloads, 1);
});

test('does not download when no update is available and treats failures as nonfatal', async () => {
  const unavailable = createStartupUpdateCoordinator();
  let downloads = 0;

  assert.equal(await unavailable.checkAndDownload({
    checkForUpdateAsync: async () => ({ isAvailable: false }),
    fetchUpdateAsync: async () => {
      downloads += 1;
      return { isNew: true };
    },
  }), false);
  assert.equal(downloads, 0);

  const offline = createStartupUpdateCoordinator();
  assert.equal(await offline.checkAndDownload({
    checkForUpdateAsync: async () => { throw new Error('offline'); },
    fetchUpdateAsync: async () => ({ isNew: true }),
  }), false);
});

test('allows only one restart prompt', () => {
  const coordinator = createStartupUpdateCoordinator();
  assert.equal(coordinator.claimPrompt(), true);
  assert.equal(coordinator.claimPrompt(), false);
});
