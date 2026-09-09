import { Column } from '@expo/ui';
import { Image } from '@expo/ui/jetpack-compose';
import { size } from '@expo/ui/jetpack-compose/modifiers';
import { useState } from 'react';
import { Image as RNImage } from 'react-native';

import { Text } from '@/components/text';
import type { ActivityCardImageProps } from '@/presentation/activity-card-image';
import { useOffsiteTheme } from '@/theme';

export function ActivityCardImage({ image, width }: ActivityCardImageProps) {
  const { colors } = useOffsiteTheme();
  const [failed, setFailed] = useState(false);
  const height = width * 9 / 16;
  if (failed) return <Column alignment="center" style={{ width, height, paddingTop: height / 2 - 12 }}>
    <Text textStyle={{ color: colors.secondaryText }}>Image unavailable</Text>
  </Column>;
  // A Compose image lets photo taps reach the surrounding native card button.
  return <Image source={RNImage.resolveAssetSource(image.source)} contentScale="crop" contentDescription={null}
    modifiers={[size(width, height)]} onError={() => setFailed(true)} />;
}
