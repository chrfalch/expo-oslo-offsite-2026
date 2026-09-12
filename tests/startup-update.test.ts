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


test('checks again after no update or an offline failure on a later foreground', async () => {
  const coordinator = createStartupUpdateCoordinator();
  let checks = 0;
  let downloads = 0;
  const api = {
    checkForUpdateAsync: async () => {
      checks += 1;
      if (checks === 2) throw new Error('offline');
      return { isAvailable: checks >= 3 };
    },
    fetchUpdateAsync: async () => { downloads += 1; return { isNew: true }; },
  };
  assert.equal(await coordinator.checkAndDownload(api), false);
  assert.equal(await coordinator.checkAndDownload(api), false);
  assert.equal(await coordinator.checkAndDownload(api), true);
  assert.equal(await coordinator.checkAndDownload(api), true);
  assert.equal(checks, 3);
  assert.equal(downloads, 1);
});

test('retries a failed download on a later foreground', async () => {
  const coordinator = createStartupUpdateCoordinator();
  let downloads = 0;
  const api = {
    checkForUpdateAsync: async () => ({ isAvailable: true }),
    fetchUpdateAsync: async () => {
      if (++downloads === 1) throw new Error('offline');
      return { isNew: true };
    },
  };
  assert.equal(await coordinator.checkAndDownload(api), false);
  assert.equal(await coordinator.checkAndDownload(api), true);
  assert.equal(downloads, 2);
});

test('an interactive refresh downloads and applies an update once', async () => {
  const coordinator = createStartupUpdateCoordinator();
  let checks = 0;
  let downloads = 0;
  let reloads = 0;
  const api = {
    checkForUpdateAsync: async () => { checks += 1; return { isAvailable: true }; },
    fetchUpdateAsync: async () => { downloads += 1; return { isNew: true }; },
    reloadAsync: async () => { reloads += 1; },
  };

  const results = await Promise.all([
    coordinator.checkDownloadAndApply(api),
    coordinator.checkDownloadAndApply(api),
  ]);

  assert.deepEqual(results, ['reloading', 'reloading']);
  assert.equal(checks, 1);
  assert.equal(downloads, 1);
  assert.equal(reloads, 1);
  assert.equal(coordinator.claimPrompt(), false);
});

test('an interactive refresh joins a startup download and suppresses its prompt', async () => {
  const coordinator = createStartupUpdateCoordinator();
  let finishCheck: ((result: { isAvailable: boolean }) => void) | undefined;
  let reloads = 0;
  const api = {
    checkForUpdateAsync: () => new Promise<{ isAvailable: boolean }>((resolve) => { finishCheck = resolve; }),
    fetchUpdateAsync: async () => ({ isNew: true }),
    reloadAsync: async () => { reloads += 1; },
  };

  const startup = coordinator.checkAndDownload(api);
  const interactive = coordinator.checkDownloadAndApply(api);
  assert.equal(coordinator.claimPrompt(), false);
  finishCheck?.({ isAvailable: true });

  assert.equal(await startup, true);
  assert.equal(await interactive, 'reloading');
  assert.equal(reloads, 1);
});

test('an interactive refresh settles when no update exists or reload fails', async () => {
  const unavailable = createStartupUpdateCoordinator();
  assert.equal(await unavailable.checkDownloadAndApply({
    checkForUpdateAsync: async () => ({ isAvailable: false }),
    fetchUpdateAsync: async () => ({ isNew: true }),
    reloadAsync: async () => {},
  }), 'no-update');

  const failedReload = createStartupUpdateCoordinator();
  assert.equal(await failedReload.checkDownloadAndApply({
    checkForUpdateAsync: async () => ({ isAvailable: true }),
    fetchUpdateAsync: async () => ({ isNew: true }),
    reloadAsync: async () => { throw new Error('reload failed'); },
  }), 'reload-failed');
  assert.equal(failedReload.claimPrompt(), true);
});
