import { Button, Column, Text } from '@expo/ui';
import { Component, type ReactNode } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeContent } from '@/presentation/native-content';
import { useOffsiteTheme } from '@/theme';

class MapBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export function LocationView({ title, address, notice, accuracy, map, openLabel, onOpenMaps, onOpenArea, error }: {
  title: string; address: string; notice?: string; accuracy?: string; map?: ReactNode;
  openLabel: string; onOpenMaps?: () => void; onOpenArea?: () => void; error?: string;
}) {
  const { colors } = useOffsiteTheme();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const emptyMap = <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}><NativeContent centered>
    <Text textStyle={{ color: colors.text, fontSize: 20, fontWeight: '600' }}>{map ? 'Map unavailable' : 'Exact location not in guide'}</Text>
    <Text textStyle={{ color: colors.secondaryText, fontSize: 15 }}>{map ? 'The saved location details are still available below.' : 'No pin placed.'}</Text>
  </NativeContent></View>;
  return <View style={{ flex: 1, backgroundColor: colors.background }}>
    <View style={{ height: Math.max(240, Math.min(410, height * 0.4)), backgroundColor: colors.surface }} accessibilityLabel={`Map for ${title}`}>
      {map ? <MapBoundary fallback={emptyMap}>{map}</MapBoundary> : emptyMap}
    </View>
    <ScrollView contentInsetAdjustmentBehavior="never" contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24 }}>
      <NativeContent><Column spacing={16}>
        <Text testID="location-title" textStyle={{ color: colors.text, fontSize: 25, fontWeight: '700' }}>{title}</Text>
        <Text textStyle={{ color: colors.secondaryText, fontSize: 16 }}>{address}</Text>
        {notice ? <Text testID="location-notice" textStyle={{ color: colors.text, fontSize: 15, lineHeight: 23 }}>{notice}</Text> : null}
        {onOpenMaps ? <Button label={openLabel} onPress={onOpenMaps} testID="open-native-maps" /> : null}
        {onOpenArea ? <Button label="Show Torshov area" onPress={onOpenArea} testID="show-location-area" variant="outlined" /> : null}
        {error ? <Text textStyle={{ color: colors.text }}>{error}</Text> : null}
        {accuracy ? <Text textStyle={{ color: colors.secondaryText, fontSize: 13, lineHeight: 20 }}>{accuracy}</Text> : null}
      </Column></NativeContent>
    </ScrollView>
  </View>;
}
