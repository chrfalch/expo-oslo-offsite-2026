import { useCallback, useEffect, useRef } from 'react';
import { Alert, AppState, Platform } from 'react-native';
import * as Updates from 'expo-updates';

import { createStartupUpdateCoordinator } from './startup-update';

const coordinator = createStartupUpdateCoordinator();

export function useStartupUpdate() {
  const { isUpdatePending } = Updates.useUpdates();
  const mounted = useRef(false);
  const pending = useRef(isUpdatePending);
  const enabled = !__DEV__ && Platform.OS !== 'web' && Updates.isEnabled;

  const promptForRestart = useCallback(() => {
    if (!mounted.current || AppState.currentState !== 'active' || !coordinator.claimPrompt()) {
      return;
    }

    Alert.alert(
      'Update ready',
      'The latest version has been downloaded.',
      [
        { text: 'Later', style: 'cancel' },
        {
          text: 'Restart now',
          onPress: () => {
            void Updates.reloadAsync().catch(() => {
              if (!mounted.current) return;
              Alert.alert(
                'Could not restart',
                'Please close and reopen the app to use the latest version.',
              );
            });
          },
        },
      ],
      { cancelable: true },
    );
  }, []);

  useEffect(() => {
    mounted.current = true;
    if (!enabled) return () => { mounted.current = false; };

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && pending.current) promptForRestart();
    });

    void coordinator.checkAndDownload(Updates).then((downloaded) => {
      if (!downloaded || !mounted.current) return;
      pending.current = true;
      promptForRestart();
    });

    return () => {
      mounted.current = false;
      subscription.remove();
    };
  }, [enabled, promptForRestart]);

  useEffect(() => {
    if (!enabled || !isUpdatePending) return;
    pending.current = true;
    promptForRestart();
  }, [enabled, isUpdatePending, promptForRestart]);
}
