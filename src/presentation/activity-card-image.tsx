import { RNHostView } from '@expo/ui';
import { useState } from 'react';
import { Image, Text, View } from 'react-native';

import type { GuideImageModel } from '@/presentation/guide-image';
import { useOffsiteTheme } from '@/theme';

export type ActivityCardImageProps = { image: GuideImageModel; width: number };

export function ActivityCardImage({ image, width }: ActivityCardImageProps) {
  const { colors } = useOffsiteTheme();
  const [status, setStatus] = useState<'loading' | 'loaded' | 'failed'>('loading');
  const height = width * 9 / 16;
  return <RNHostView matchContents>
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
      style={{ width, height, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
      {status !== 'loaded' ? <Text style={{ position: 'absolute', color: colors.secondaryText }}>
        {status === 'failed' ? 'Image unavailable' : 'Loading image…'}
      </Text> : null}
      <Image source={image.source} resizeMode="cover" style={{ width, height, opacity: status === 'loaded' ? 1 : 0 }}
        onLoad={() => setStatus('loaded')} onError={() => setStatus('failed')} />
    </View>
  </RNHostView>;
}
