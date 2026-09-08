import { Picker, Text } from '@expo/ui';

import { OffsiteScreen } from '@/components/offsite-screen';
import { GuideCard, type GuideCardModel } from '@/presentation/guide-card';
import { useOffsiteTheme } from '@/theme';

export type ScheduleViewProps = {
  dateRange: string;
  working: GuideCardModel;
  events: readonly GuideCardModel[];
  timeZoneNote: string;
  direction: string;
  onDirectionChange: (direction: string) => void;
  travelers: readonly GuideCardModel[];
};

export function ScheduleView(props: ScheduleViewProps) {
  const { colors } = useOffsiteTheme();
  return (
    <OffsiteScreen>
      <Text textStyle={{ fontSize: 15, color: colors.secondaryText }}>{props.dateRange}</Text>
      <GuideCard card={props.working} />
      {props.events.map((card) => <GuideCard key={card.id} card={card} />)}
      <Text textStyle={{ fontSize: 14, color: colors.secondaryText }}>{props.timeZoneNote}</Text>
      <Text textStyle={{ fontSize: 22, fontWeight: '700', color: colors.text }}>Team travel</Text>
      <Picker selectedValue={props.direction} onValueChange={props.onDirectionChange} testID="travel-direction">
        <Picker.Item label="Arrivals" value="arrival" />
        <Picker.Item label="Departures" value="departure" />
      </Picker>
      {props.travelers.map((card) => <GuideCard key={card.id} card={card} />)}
    </OffsiteScreen>
  );
}
