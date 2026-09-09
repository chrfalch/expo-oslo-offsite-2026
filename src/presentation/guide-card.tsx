import { RNHostView } from '@expo/ui';
import { useWindowDimensions } from 'react-native';
import { Text } from '@/components/text';
import { Button } from '@/components/button';
import { DetailsDisclosure } from '@/components/details-disclosure';

import { InfoCard } from '@/components/info-card';
import { WebsiteButton } from '@/components/website-button';
import { GuideImage, type GuideImageModel } from '@/presentation/guide-image';
import { PhotoGallery, type PhotoModel } from '@/presentation/photo-gallery';
import { useContentWidth, useOffsiteTheme } from '@/theme';

export type GuideCardModel = {
  id: string;
  title: string;
  description: string;
  eyebrow?: string;
  image?: GuideImageModel;
  photos?: readonly PhotoModel[];
  details?: readonly string[];
  disclosure?: { label: string; details: readonly string[] };
  links?: readonly { label: string; url: string; failureMessage?: string }[];
  actions?: readonly { label: string; onPress: () => void; testID?: string; primary?: boolean; selected?: boolean }[];
};

export function GuideCard({ card }: { card: GuideCardModel }) {
  const { colors } = useOffsiteTheme();
  const width = useContentWidth() - 44;
  const { fontScale } = useWindowDimensions();
  const icon = card.image?.kind === 'icon';
  return (
    <InfoCard title={card.title} eyebrow={card.eyebrow} description={card.description}
      leading={icon && fontScale <= 1.3 ? <RNHostView matchContents><GuideImage image={card.image!} width={56} /></RNHostView> : undefined}>
      {card.details?.map((detail, index) => (
        <Text key={`${index}:${detail}`} textStyle={{ fontSize: 15, lineHeight: 23, color: colors.secondaryText }}>
          {detail}
        </Text>
      ))}
      {card.actions?.map((action) => <Button key={action.label} label={action.label} onPress={action.onPress} testID={action.testID} selected={action.selected} variant={action.primary ? 'filled' : 'outlined'} />)}
      {card.image && !icon ? <RNHostView matchContents><GuideImage key={card.image.id} image={card.image} width={width} /></RNHostView> : null}
      {card.photos ? <RNHostView matchContents><PhotoGallery photos={card.photos} width={width} /></RNHostView> : null}
      {card.links?.map((link) => <WebsiteButton key={link.url} {...link} />)}
      {card.disclosure ? <DetailsDisclosure {...card.disclosure} width={width} /> : null}
    </InfoCard>
  );
}
