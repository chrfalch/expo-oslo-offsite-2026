export type StartupUpdateApi = {
  checkForUpdateAsync: () => Promise<{ isAvailable: boolean }>;
  fetchUpdateAsync: () => Promise<{ isNew: boolean }>;
};

export function createStartupUpdateCoordinator() {
  let download: Promise<boolean> | undefined;
  let promptClaimed = false;
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

    claimPrompt() {
      if (promptClaimed) return false;
      promptClaimed = true;
      return true;
    },
  };
}
