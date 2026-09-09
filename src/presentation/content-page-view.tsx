import { Checkbox, Column, ListItem, Picker, Text } from '@expo/ui';

import { OffsiteScreen } from '@/components/offsite-screen';
import { GuideCard, type GuideCardModel } from '@/presentation/guide-card';
import { useContentWidth, useOffsiteTheme } from '@/theme';

export type ActionRowModel = { id: string; title: string; detail?: string; onPress: () => void; testID?: string };
export type ChoiceModel = { id: string; label: string; value: string; options: readonly { value: string; label: string }[]; onChange: (value: string) => void };
export type ContentSection = {
  id: string;
  title?: string;
  description?: string;
  cards?: readonly GuideCardModel[];
  rows?: readonly ActionRowModel[];
  checks?: readonly { id: string; label: string; detail: string; checked: boolean; onToggle: () => void }[];
};

export function ActionRow({ row }: { row: ActionRowModel }) {
  const { colors } = useOffsiteTheme();
  return <ListItem onPress={row.onPress} supportingText={row.detail} testID={row.testID ?? row.id}
    colors={{ containerColor: colors.background, contentColor: colors.text, supportingContentColor: colors.secondaryText }}
    trailing={<Text textStyle={{ color: colors.accent, fontSize: 22 }}>›</Text>}>
    <Text textStyle={{ color: colors.text, fontSize: 17, fontWeight: '600' }}>{row.title}</Text>
  </ListItem>;
}

export function ContentPageView({ intro, choices, sections }: { intro?: string; choices?: readonly ChoiceModel[]; sections: readonly ContentSection[] }) {
  const { colors } = useOffsiteTheme();
  const width = useContentWidth();
  return <OffsiteScreen>
    {intro ? <Text textStyle={{ fontSize: 15, lineHeight: 22, color: colors.secondaryText }}>{intro}</Text> : null}
    {choices?.map((choice) => <Column key={choice.id} spacing={6} style={{ width }}>
      <Text textStyle={{ color: colors.secondaryText }}>{choice.label}</Text>
      <Picker testID={choice.id} selectedValue={choice.value} onValueChange={choice.onChange}>
        {choice.options.map((option) => <Picker.Item key={option.value} {...option} />)}
      </Picker>
    </Column>)}
    {sections.map((section) => <Column key={section.id} spacing={14} style={{ width }}>
      {section.title ? <Text testID={`${section.id}-heading`} textStyle={{ fontSize: 22, fontWeight: '700', color: colors.text }}>{section.title}</Text> : null}
      {section.description ? <Text textStyle={{ fontSize: 15, lineHeight: 23, color: colors.secondaryText }}>{section.description}</Text> : null}
      {section.cards?.map((card) => <GuideCard key={card.id} card={card} />)}
      {section.rows?.map((row) => <ActionRow key={row.id} row={row} />)}
      {section.checks?.map((check) => <Column key={check.id} spacing={7} style={{ width, padding: 16, borderRadius: 16, backgroundColor: colors.surface }}>
        <Checkbox label={check.label} value={check.checked} onValueChange={check.onToggle} testID={check.id} />
        {check.detail ? <Text textStyle={{ color: colors.secondaryText, fontSize: 14, lineHeight: 21 }}>{check.detail}</Text> : null}
      </Column>)}
    </Column>)}
  </OffsiteScreen>;
}
