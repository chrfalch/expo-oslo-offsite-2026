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

    const checkForUpdate = () => {
      if (pending.current) {
        promptForRestart();
        return;
      }
      void coordinator.checkAndDownload(Updates).then((downloaded) => {
        if (!downloaded || !mounted.current) return;
        pending.current = true;
        promptForRestart();
      });
    };

    let wasBackgrounded = AppState.currentState === 'background';
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'background') wasBackgrounded = true;
      if (state !== 'active') return;
      if (wasBackgrounded) {
        wasBackgrounded = false;
        checkForUpdate();
      } else if (pending.current) {
        promptForRestart();
      }
    });

    checkForUpdate();

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
