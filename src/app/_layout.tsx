import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import AppTabs from '@/components/app-tabs';
import { useOffsiteTheme } from '@/theme';

export default function RootLayout() {
  const { colors, scheme } = useOffsiteTheme();
  const baseTheme = scheme === 'dark' ? DarkTheme : DefaultTheme;

  useEffect(() => {
    if (__DEV__ && process.env.EXPO_OS !== 'web') {
      // Keep the preview's floating developer button from covering the Expo mark.
      void import('expo-dev-client').then(({ setToolsButtonVisible }) => setToolsButtonVisible(false));
    }
  }, []);

  return (
    <ThemeProvider
      value={{
        ...baseTheme,
        colors: {
          ...baseTheme.colors,
          primary: colors.accent,
          background: colors.background,
          card: colors.background,
          text: colors.text,
          border: colors.border,
        },
      }}>
      <StatusBar style="auto" />
      <AppTabs />
    </ThemeProvider>
  );
}
