import { Column, RNHostView } from '@expo/ui';
import { Text } from '@/components/text';
import { ActionRowControl } from '@/components/action-row';
import { ChoiceControl } from '@/components/choice-control';
import { DetailsDisclosure } from '@/components/details-disclosure';

import { OffsiteScreen } from '@/components/offsite-screen';
import { GuideCard, type GuideCardModel } from '@/presentation/guide-card';
import { GuideImage, type GuideImageModel } from '@/presentation/guide-image';
import { useContentWidth, useOffsiteTheme } from '@/theme';

export type ActionRowModel = { id: string; title: string; detail?: string; onPress: () => void; testID?: string };
export type ChoiceModel = { id: string; label: string; value: string; options: readonly { value: string; label: string }[]; onChange: (value: string) => void };
export type ContentSection = {
  id: string;
  title?: string;
  description?: string;
  disclosure?: { label: string; details: readonly string[] };
  image?: GuideImageModel;
  cards?: readonly GuideCardModel[];
  rows?: readonly ActionRowModel[];
  checks?: readonly { id: string; label: string; detail: string; checked: boolean; onToggle: () => void }[];
};

export function ActionRow({ row }: { row: ActionRowModel }) {
  return <ActionRowControl {...row} testID={row.testID ?? row.id} />;
}

export function ContentPageView({ intro, choices, sections }: { intro?: string; choices?: readonly ChoiceModel[]; sections: readonly ContentSection[] }) {
  const { colors } = useOffsiteTheme();
  const width = useContentWidth();
  return <OffsiteScreen>
    {intro ? <Text textStyle={{ fontSize: 15, lineHeight: 22, color: colors.secondaryText }}>{intro}</Text> : null}
    {choices?.map((choice) => <ChoiceControl key={choice.id} {...choice} width={width} />)}
    {sections.map((section) => <Column key={section.id} spacing={14} style={{ width }}>
      {section.title ? <Text testID={`${section.id}-heading`} textStyle={{ fontSize: 22, fontWeight: '700', color: colors.text }}>{section.title}</Text> : null}
      {section.description ? <Text textStyle={{ fontSize: 15, lineHeight: 23, color: colors.secondaryText }}>{section.description}</Text> : null}
      {section.image ? <RNHostView matchContents><GuideImage key={section.image.id} image={section.image} width={width} /></RNHostView> : null}
      {section.cards?.map((card) => <GuideCard key={card.id} card={card} />)}
      {section.rows?.map((row) => <ActionRow key={row.id} row={row} />)}
      {section.disclosure ? <DetailsDisclosure {...section.disclosure} width={width} /> : null}
      {section.checks?.map((check) => <Column key={check.id} style={{ width, paddingHorizontal: 16, borderRadius: 16, backgroundColor: colors.surface }}>
        <ActionRowControl title={check.label} detail={check.detail} selected={check.checked} onPress={check.onToggle} testID={check.id} width={width - 32} />
      </Column>)}
    </Column>)}
  </OffsiteScreen>;
}
