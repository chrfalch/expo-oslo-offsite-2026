import { Column } from '@expo/ui';
import { Text } from '@/components/text';
import { SelectableText as SelectableDetail } from '@/components/selectable-text';
import { Button } from '@/components/button';
import { DetailsDisclosure } from '@/components/details-disclosure';
import { Component, useState, type ReactNode } from 'react';
import { Platform, ScrollView, Text as SelectableText, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeContent } from '@/presentation/native-content';
import { GuideImage, type GuideImageModel } from '@/presentation/guide-image';
import { PhotoGallery, type PhotoModel } from '@/presentation/photo-gallery';
import { WebsiteButton } from '@/components/website-button';
import { useOffsiteTheme } from '@/theme';

class MapBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export function LocationSheet({ children }: { children: ReactNode }) {
  const { colors } = useOffsiteTheme();
  if (Platform.OS !== 'android') return children;
  // Android needs a visible drag handle above the sheet content.
  return <View style={{ flex: 1, backgroundColor: colors.background }}>
    <View style={{ alignSelf: 'center', width: 32, height: 4, borderRadius: 2, backgroundColor: colors.border, marginVertical: 10 }} />
    {children}
  </View>;
}

export function LocationView({ title, address, notice, accuracy, map, image, photos, websiteUrl, websiteLabel = 'Visit website', description, details, openLabel, onOpenMaps, onOpenArea, error }: {
  title: string; address: string; notice?: string; accuracy?: string; map?: ReactNode;
  image?: GuideImageModel; photos?: readonly PhotoModel[]; websiteUrl?: string; websiteLabel?: string;
  description?: string; details?: readonly string[];
  openLabel: string; onOpenMaps?: () => void; onOpenArea?: () => void; error?: string;
}) {
  const { colors } = useOffsiteTheme();
  const window = useWindowDimensions();
  const [{ height, width }, setSize] = useState({ height: window.height, width: window.width });
  const insets = useSafeAreaInsets();
  const emptyMap = <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}><NativeContent centered>
    <Text textStyle={{ color: colors.text, fontSize: 20, fontWeight: '600' }}>{map ? 'Map unavailable' : 'Exact location not in guide'}</Text>
    <Text textStyle={{ color: colors.secondaryText, fontSize: 15 }}>{map ? 'The saved location details are still available below.' : 'No pin placed.'}</Text>
  </NativeContent></View>;
  return <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentInsetAdjustmentBehavior="automatic"
    contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    onLayout={({ nativeEvent: { layout } }) => setSize({ width: layout.width, height: layout.height })}>
    {map || !onOpenMaps ? <View style={{ height: Math.max(160, Math.min(320, height * 0.4)), backgroundColor: colors.surface }} accessibilityLabel={`Map for ${title}`}>
      {map ? <MapBoundary fallback={emptyMap}>{map}</MapBoundary> : emptyMap}
    </View> : null}
    <View style={{ padding: 20, gap: 16 }}>
      <NativeContent><Text testID="location-title" textStyle={{ color: colors.text, fontSize: 25, fontWeight: '700' }}>{title}</Text></NativeContent>
      <SelectableText selectable testID="location-address" style={{ color: colors.text, fontSize: 17 }}>{address}</SelectableText>
      <NativeContent><Column spacing={16}>
        {notice ? <Text testID="location-notice" textStyle={{ color: colors.text, fontSize: 15, lineHeight: 23 }}>{notice}</Text> : null}
        {onOpenMaps ? <Button label={openLabel} onPress={onOpenMaps} testID="open-native-maps" /> : null}
        {onOpenArea ? <Button label="Show Torshov area" onPress={onOpenArea} testID="show-location-area" variant="outlined" /> : null}
        {websiteUrl ? <WebsiteButton label={websiteLabel} url={websiteUrl} /> : null}
        {error ? <Text textStyle={{ color: colors.text }}>{error}</Text> : null}
        {accuracy ? <DetailsDisclosure label="About this location" details={[accuracy]} width={width - 40} /> : null}
      </Column></NativeContent>
      {image ? <GuideImage key={image.id} image={image} width={width - 40} /> : null}
      {photos ? <PhotoGallery key={title} photos={photos} width={width - 40} /> : null}
      {description || details?.length ? <NativeContent><Column spacing={12}>
        {description ? <Text textStyle={{ color: colors.text, fontSize: 16, lineHeight: 24 }}>{description}</Text> : null}
        {details?.map((detail, index) => <SelectableDetail key={index} width={width - 40} textStyle={{ color: colors.secondaryText, fontSize: 15, lineHeight: 23 }}>{detail}</SelectableDetail>)}
      </Column></NativeContent> : null}
    </View>
  </ScrollView>;
}
