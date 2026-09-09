import { Column, Row } from '@expo/ui';

import { CardButton } from '@/components/card-button';
import { SystemSymbol } from '@/components/symbol';
import { Text } from '@/components/text';
import { ActivityCardImage } from '@/presentation/activity-card-image';
import type { GuideImageModel } from '@/presentation/guide-image';
import { layout, useContentWidth, useOffsiteTheme } from '@/theme';

export type UpcomingActivityModel = {
  id: string;
  title: string;
  description: string;
  eyebrow: string;
  image?: GuideImageModel;
  onPress: () => void;
};

export function UpcomingActivityCard({ activity }: { activity: UpcomingActivityModel }) {
  const { colors } = useOffsiteTheme();
  const width = useContentWidth();
  const innerWidth = width - 44;

  return <CardButton onPress={activity.onPress} testID="overview-activity"
    accessibilityLabel={`${activity.title}, ${activity.eyebrow}, ${activity.description}`}>
    <Column spacing={0} style={{ width, borderRadius: layout.cardRadius, backgroundColor: colors.surface }}>
      {activity.image ? <ActivityCardImage key={activity.image.id} image={activity.image} width={width} /> : null}
      <Column spacing={12} style={{ width, padding: 22 }}>
        <Text textStyle={{ fontSize: 12, fontWeight: '700', letterSpacing: 1.4, color: colors.accent }}>{activity.eyebrow}</Text>
        <Row spacing={12} alignment="center" style={{ width: innerWidth }}>
          <Column spacing={8} style={{ width: innerWidth - 34 }}>
            <Text role="title2" textStyle={{ fontWeight: '600', color: colors.text }}>{activity.title}</Text>
            <Text textStyle={{ fontSize: 16, lineHeight: 24, color: colors.secondaryText }}>{activity.description}</Text>
          </Column>
          <Column style={{ width: 22 }}><SystemSymbol name="chevron.right" color={colors.secondaryText} /></Column>
        </Row>
      </Column>
    </Column>
  </CardButton>;
}
