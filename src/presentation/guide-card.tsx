import { Text } from '@expo/ui';

import { InfoCard } from '@/components/info-card';
import { WebsiteButton } from '@/components/website-button';
import { useOffsiteTheme } from '@/theme';

export type GuideCardModel = {
  id: string;
  title: string;
  description: string;
  eyebrow?: string;
  details?: readonly string[];
  links?: readonly { label: string; url: string }[];
};

export function GuideCard({ card }: { card: GuideCardModel }) {
  const { colors } = useOffsiteTheme();
  return (
    <InfoCard title={card.title} eyebrow={card.eyebrow} description={card.description}>
      {card.details?.map((detail, index) => (
        <Text key={`${index}:${detail}`} textStyle={{ fontSize: 15, lineHeight: 23, color: colors.secondaryText }}>
          {detail}
        </Text>
      ))}
      {card.links?.map((link) => <WebsiteButton key={link.url} {...link} />)}
    </InfoCard>
  );
}
