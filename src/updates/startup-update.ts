export type StartupUpdateApi = {
  checkForUpdateAsync: () => Promise<{ isAvailable: boolean }>;
  fetchUpdateAsync: () => Promise<{ isNew: boolean }>;
};

export type InteractiveUpdateApi = StartupUpdateApi & {
  reloadAsync: () => Promise<void>;
};

export type InteractiveUpdateResult = 'no-update' | 'reloading' | 'reload-failed';

export function createStartupUpdateCoordinator() {
  let download: Promise<boolean> | undefined;
  let interactiveUpdate: Promise<InteractiveUpdateResult> | undefined;
  let promptClaimed = false;
  let restartHandled = false;
  let updateDownloaded = false;

  return {
    checkAndDownload(api: StartupUpdateApi) {
      if (updateDownloaded) return Promise.resolve(true);
      download ??= (async () => {
        try {
          const check = await api.checkForUpdateAsync();
          if (!check.isAvailable) return false;

          const fetched = await api.fetchUpdateAsync();
          updateDownloaded = fetched.isNew;
          return updateDownloaded;
        } catch {
          // Being offline or unable to reach the update service should not interrupt use of the app.
          return false;
        }
      })().finally(() => { download = undefined; });

      return download;
    },

    checkDownloadAndApply(api: InteractiveUpdateApi) {
      interactiveUpdate ??= (async (): Promise<InteractiveUpdateResult> => {
        const downloaded = await this.checkAndDownload(api);
        if (!downloaded) return 'no-update';

        restartHandled = true;
        try {
          await api.reloadAsync();
          return 'reloading';
        } catch {
          restartHandled = false;
          return 'reload-failed';
        }
      })().finally(() => { interactiveUpdate = undefined; });

      return interactiveUpdate;
    },

    markDownloaded() {
      updateDownloaded = true;
    },

    claimPrompt() {
      if (interactiveUpdate || restartHandled || promptClaimed) return false;
      promptClaimed = true;
      return true;
    },
  };
}
