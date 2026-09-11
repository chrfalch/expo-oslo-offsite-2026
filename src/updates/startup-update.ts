export type StartupUpdateApi = {
  checkForUpdateAsync: () => Promise<{ isAvailable: boolean }>;
  fetchUpdateAsync: () => Promise<{ isNew: boolean }>;
};

export function createStartupUpdateCoordinator() {
  let download: Promise<boolean> | undefined;
  let promptClaimed = false;

  return {
    checkAndDownload(api: StartupUpdateApi) {
      download ??= (async () => {
        try {
          const check = await api.checkForUpdateAsync();
          if (!check.isAvailable) return false;

          const fetched = await api.fetchUpdateAsync();
          return fetched.isNew;
        } catch {
          // Being offline or unable to reach the update service should not interrupt startup.
          return false;
        }
      })();

      return download;
    },

    claimPrompt() {
      if (promptClaimed) return false;
      promptClaimed = true;
      return true;
    },
  };
}
