import { Picker, Text } from '@expo/ui';
import type { ReactNode } from 'react';

import { OffsiteScreen } from '@/components/offsite-screen';
import { GuideCard, type GuideCardModel } from '@/presentation/guide-card';
import { useOffsiteTheme } from '@/theme';

export type OsloViewProps = {
  location: string;
  workspace: GuideCardModel;
  sections: readonly { id: string; label: string }[];
  section: string;
  onSectionChange: (section: string) => void;
  cards: readonly GuideCardModel[];
  places?: ReactNode;
};

export function OsloView(props: OsloViewProps) {
  const { colors } = useOffsiteTheme();
  return (
    <OffsiteScreen>
      <Text textStyle={{ fontSize: 15, color: colors.secondaryText }}>{props.location}</Text>
      <GuideCard card={props.workspace} />
      <Text textStyle={{ color: colors.secondaryText }}>Explore the guide</Text>
      <Picker selectedValue={props.section} onValueChange={props.onSectionChange} testID="oslo-section">
        {props.sections.map((section) => <Picker.Item key={section.id} label={section.label} value={section.id} />)}
      </Picker>
      {props.places}
      {props.cards.map((card) => <GuideCard key={card.id} card={card} />)}
    </OffsiteScreen>
  );
}
