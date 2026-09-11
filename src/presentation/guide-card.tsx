import { RNHostView, Row } from '@expo/ui';
import { Platform, Pressable, Text as NativeText, View, useWindowDimensions } from 'react-native';
import { SelectableText } from '@/components/selectable-text';
import { Button } from '@/components/button';
import { rowContentModifiers } from '@/components/control-modifiers';
import { DetailsDisclosure } from '@/components/details-disclosure';
import { SystemSymbol, type SymbolProps } from '@/components/symbol';

import { InfoCard } from '@/components/info-card';
import { WebsiteButton } from '@/components/website-button';
import { GuideImage, type GuideImageModel } from '@/presentation/guide-image';
import { PhotoGallery, type PhotoModel } from '@/presentation/photo-gallery';
import { layout, useContentWidth, useOffsiteTheme } from '@/theme';

export type GuideCardModel = {
  id: string;
  title: string;
  description: string;
  eyebrow?: string;
  image?: GuideImageModel;
  photos?: readonly PhotoModel[];
  details?: readonly string[];
  housemates?: readonly string[];
  disclosure?: { label: string; details: readonly string[] };
  links?: readonly { label: string; url: string; failureMessage?: string }[];
  actions?: readonly { label: string; onPress: () => void; testID?: string; primary?: boolean; compact?: boolean; selected?: boolean }[];
  headerActions?: readonly { label: string; icon: SymbolProps['name']; onPress: () => void; testID?: string; selected?: boolean }[];
};

export function GuideCard({ card }: { card: GuideCardModel }) {
  const { colors } = useOffsiteTheme();
  const width = useContentWidth() - 44;
  const { fontScale } = useWindowDimensions();
  const icon = card.image?.kind === 'icon';
  const headerActions = card.headerActions?.length ? card.headerActions : undefined;
  const headerActionsWidth = (headerActions?.length ?? 0) * 48;
  return (
    <InfoCard title={card.title} eyebrow={card.eyebrow} description={card.description}
      leading={icon && fontScale <= 1.3 && !headerActions ? <RNHostView matchContents><GuideImage image={card.image!} width={56} /></RNHostView> : undefined}
      headerTrailingWidth={headerActionsWidth}
      headerTrailing={headerActions ? <Row spacing={0} style={{ width: headerActionsWidth }}>
        {headerActions.map((action) => <Button key={action.testID ?? action.label} variant="text" onPress={action.onPress}
          selected={action.selected} testID={action.testID} accessibilityLabel={action.label} style={{ width: 48, height: 48 }}>
          {Platform.OS === 'ios' ? <Row alignment="center" style={{ width: 48, height: 48 }} modifiers={rowContentModifiers(48)}>
            <SystemSymbol name={action.icon} color={colors.accent} />
          </Row> : <SystemSymbol name={action.icon} color={colors.accent} />}
        </Button>)}
      </Row> : undefined}>
      {card.housemates?.length ? <RNHostView matchContents style={{ width }}>
        <View style={{ width, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {card.housemates.map((name) => <View key={name} style={{ maxWidth: '100%', borderRadius: 18, backgroundColor: colors.accentSoft, paddingHorizontal: 12, paddingVertical: 6 }}>
            <NativeText style={{ fontSize: 15, fontWeight: '600', color: colors.accent }}>{name}</NativeText>
          </View>)}
        </View>
      </RNHostView> : null}
      {card.details?.map((detail, index) => (
        <SelectableText key={`${index}:${detail}`} width={width} textStyle={{ fontSize: 15, lineHeight: 23, color: colors.secondaryText }}>
          {detail}
        </SelectableText>
      ))}
      {card.actions?.map((action) => <Button key={action.label} label={action.label} onPress={action.onPress} testID={action.testID} selected={action.selected} variant={action.primary ? 'filled' : 'outlined'} />)}
      {card.image && !icon ? <RNHostView matchContents><GuideImage key={card.image.id} image={card.image} width={width} /></RNHostView> : null}
      {card.photos ? <RNHostView matchContents><PhotoGallery photos={card.photos} width={width} /></RNHostView> : null}
      {card.links?.map((link) => <WebsiteButton key={link.url} {...link} />)}
      {card.disclosure ? <DetailsDisclosure {...card.disclosure} width={width} /> : null}
    </InfoCard>
  );
}

/** Keep the wrapping content and its card press in the same React Native tree. */
export function StayCard({ card, onPress }: { card: GuideCardModel; onPress: () => void }) {
  const { colors } = useOffsiteTheme();
  return <Pressable onPress={onPress} accessibilityRole="button" testID="overview-apartment"
    style={({ pressed }) => ({ padding: 22, borderRadius: layout.cardRadius, backgroundColor: colors.surface, gap: 12, opacity: pressed ? 0.7 : 1 })}>
    {card.eyebrow ? <NativeText style={{ fontSize: 12, fontWeight: '700', letterSpacing: 1.4, color: colors.accent }}>{card.eyebrow}</NativeText> : null}
    <NativeText style={{ fontSize: 22, fontWeight: '600', color: colors.text }}>{card.title}</NativeText>
    <NativeText style={{ fontSize: 16, lineHeight: 24, color: colors.secondaryText }}>{card.description}</NativeText>
    {card.housemates?.length ? <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
      <NativeText style={{ fontSize: 15, color: colors.secondaryText }}>Staying with</NativeText>
      {card.housemates.map((name) => <View key={name} style={{ maxWidth: '100%', borderRadius: 18, backgroundColor: colors.accentSoft, paddingHorizontal: 12, paddingVertical: 6 }}>
        <NativeText style={{ fontSize: 15, fontWeight: '600', color: colors.accent }}>{name}</NativeText>
      </View>)}
    </View> : null}
  </Pressable>;
}
