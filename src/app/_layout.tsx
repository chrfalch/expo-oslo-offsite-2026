import { DarkTheme, DefaultTheme, ThemeProvider, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { Host } from '@expo/ui';
import { Text } from '@/components/text';
import { Button } from '@/components/button';
import { Stack } from 'expo-router/stack';
import { Observe, ObserveRoot } from 'expo-observe';
import * as Updates from 'expo-updates';

import { NativeContent } from '@/presentation/native-content';
import { PreferencesProvider, usePreferences } from '@/state/preferences';
import { useOffsiteTheme } from '@/theme';

Observe.configure({
  environment: Updates.channel ?? (__DEV__ ? 'development' : 'production'),
  integrations: {
    'expo-router': { filteredParams: ['id', 'key'] },
  },
});

function RootLayout() {
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
      <PreferencesProvider><Navigation /></PreferencesProvider>
    </ThemeProvider>
  );
}

export default ObserveRoot.wrap(RootLayout);

function Navigation() {
  const { ready, attendee, error, store } = usePreferences();
  const { colors, scheme } = useOffsiteTheme();
  if (!ready) return <View style={{ flex: 1, padding: 24, justifyContent: 'center', backgroundColor: colors.background }}>
    {error ? <NativeContent><Text textStyle={{ color: colors.text }}>{error}</Text><Button label="Try again" onPress={() => { void store.hydrate(); }} /></NativeContent>
      : <ActivityIndicator color={colors.accent} accessibilityLabel="Loading your saved guide" />}
  </View>;
  return <View style={{ flex: 1 }}>
    {error ? <View style={{ padding: 16, paddingTop: 54, backgroundColor: colors.accentSoft }}><NativeContent>
      <Text textStyle={{ color: colors.text }}>{error}</Text><Button label="Retry saving" onPress={() => { void store.retrySave(); }} />
    </NativeContent></View> : null}
    <Stack screenOptions={{ headerTintColor: colors.accent, headerTitleStyle: { color: colors.text }, headerStyle: { backgroundColor: colors.background }, headerShadowVisible: false,
      headerBackButtonDisplayMode: 'minimal', contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Protected guard={!attendee}><Stack.Screen name="onboarding" options={{ headerShown: false }} /></Stack.Protected>
      <Stack.Protected guard={!!attendee}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Oslo Offsite' }} />
        <Stack.Screen name="choose-attendee" options={{ title: 'Change attendee' }} />
        <Stack.Screen name="profile" options={{ title: 'You' }} />
        <Stack.Screen name="travel" options={{ title: 'Travel' }} />
        <Stack.Screen name="packing" options={{ title: 'Packing' }} />
        <Stack.Screen name="places" options={{ title: 'Find a place' }} />
        <Stack.Screen name="place/[id]" options={{ title: 'Place' }} />
        <Stack.Screen name="activity/[id]" options={{ title: 'Activity' }} />
        <Stack.Screen name="location/[key]" options={{
          title: 'Location',
          presentation: 'formSheet',
          sheetAllowedDetents: [0.8, 1],
          sheetGrabberVisible: true,
          sheetCornerRadius: Platform.OS === 'android' ? 24 : undefined,
          gestureEnabled: true,
          headerBackVisible: false,
          headerRight: () => <Host matchContents ignoreSafeArea="all" colorScheme={scheme} seedColor={colors.accent} style={{ width: 80, height: 44 }}>
            <Button label="Done" variant="text" testID="close-location"
              onPress={() => router.canGoBack() ? router.back() : router.replace('/oslo')} />
          </Host>,
        }} />
        <Stack.Screen name="bases" options={{ title: 'Our bases' }} />
        <Stack.Screen name="food" options={{ title: 'Food to try' }} />
        <Stack.Screen name="practical" options={{ title: 'Practical info' }} />
        <Stack.Screen name="products" options={{ title: 'Expo products to try' }} />
        <Stack.Screen name="support" options={{ title: 'Support' }} />
      </Stack.Protected>
    </Stack>
  </View>;
}
