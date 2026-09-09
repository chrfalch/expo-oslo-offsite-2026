import { useState } from 'react';
import { Image, Linking, Text, View, type ImageSourcePropType } from 'react-native';

import { useOffsiteTheme } from '@/theme';

export type GuideImageModel = {
  id: string;
  source: ImageSourcePropType;
  caption: string;
  kind?: 'photo' | 'logo' | 'icon' | 'artwork';
  credit?: string;
  creditUrl?: string;
  licence?: string;
  licenceUrl?: string;
  aspectRatio?: number;
};

/** React Native content; wrap in RNHostView inside an Expo UI tree. */
export function GuideImage({ image, width, position }: { image: GuideImageModel; width: number; position?: string }) {
  const { colors } = useOffsiteTheme();
  const [status, setStatus] = useState<'loading' | 'loaded' | 'failed'>('loading');
  const [linkError, setLinkError] = useState<string>();
  async function openAttribution(url: string) {
    setLinkError(undefined);
    try { await Linking.openURL(url); }
    catch { setLinkError(`Could not open this link. Try again when connected: ${url}`); }
  }
  const icon = image.kind === 'icon';
  const resizeMode = image.kind && image.kind !== 'photo' ? 'contain' : 'cover';
  const imageWidth = icon ? Math.min(72, width) : width;
  const height = icon ? imageWidth : image.aspectRatio ? imageWidth / image.aspectRatio
    : image.kind === 'logo' ? Math.min(160, width * 0.5) : Math.min(400, width * 0.75);
  return <View style={{ width, gap: 8 }}>
    <View style={{ width: imageWidth, height, borderRadius: 14, overflow: 'hidden', backgroundColor: colors.surface }}>
      {status !== 'loaded' ? <View style={{ position: 'absolute', inset: 0, padding: icon ? 4 : 20, justifyContent: 'center' }}>
        <Text accessibilityLiveRegion="polite" style={{ color: colors.secondaryText, textAlign: 'center', fontSize: icon ? 11 : 15 }}>
          {status === 'failed' ? 'Image unavailable' : 'Loading image…'}
        </Text>
      </View> : null}
      <Image source={image.source} accessibilityLabel={image.caption} accessible
        resizeMode={resizeMode} style={{ width: imageWidth, height, opacity: status === 'loaded' ? 1 : 0 }}
        onLoad={() => setStatus('loaded')} onError={() => setStatus('failed')} />
    </View>
    {position ? <Text style={{ color: colors.secondaryText, fontSize: 13, lineHeight: 19 }}>{`${position} · ${image.caption}`}</Text> : null}
    {image.credit ? <Text accessibilityRole={image.creditUrl ? 'link' : undefined}
      onPress={image.creditUrl ? () => { void openAttribution(image.creditUrl!); } : undefined}
      style={{ color: colors.secondaryText, fontSize: 12, lineHeight: 18, textDecorationLine: image.creditUrl ? 'underline' : 'none' }}>{image.credit}</Text> : null}
    {image.licence && image.licenceUrl ? <Text accessibilityRole="link" onPress={() => { void openAttribution(image.licenceUrl!); }}
      style={{ color: colors.secondaryText, fontSize: 12, lineHeight: 18, textDecorationLine: 'underline' }}>{image.licence}</Text> : null}
    {linkError ? <Text accessibilityLiveRegion="polite" style={{ color: colors.secondaryText, fontSize: 12, lineHeight: 18 }}>{linkError}</Text> : null}
  </View>;
}
