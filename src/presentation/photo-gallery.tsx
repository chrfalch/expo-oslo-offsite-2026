import { ScrollView, Text, View } from 'react-native';

import { GuideImage, type GuideImageModel } from '@/presentation/guide-image';
import { useOffsiteTheme } from '@/theme';

export type PhotoModel = GuideImageModel;

/** React Native content; wrap in RNHostView when placed inside an Expo UI tree. */
export function PhotoGallery({ photos, width }: { photos: readonly PhotoModel[]; width: number }) {
  const { colors } = useOffsiteTheme();
  if (!photos.length) return <Text style={{ width, color: colors.secondaryText, fontSize: 14 }}>Photos not provided</Text>;
  return <View style={{ width, gap: 8 }}>
    {photos.length > 1 ? <Text style={{ color: colors.secondaryText, fontSize: 13 }}>Swipe to see all {photos.length} photos</Text> : null}
    <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={photos.length > 1}
      style={{ width }} contentContainerStyle={{ alignItems: 'flex-start' }} accessibilityLabel="Accommodation photos">
      {photos.map((photo, index) => <GuideImage key={photo.id} image={photo} width={width} position={`${index + 1} / ${photos.length}`} />)}
    </ScrollView>
  </View>;
}
