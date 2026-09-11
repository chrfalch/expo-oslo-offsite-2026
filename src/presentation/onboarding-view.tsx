import { Column } from '@expo/ui';
import { ActionRowControl } from '@/components/action-row';
import { Text } from '@/components/text';
import { Button } from '@/components/button';

import { OffsiteScreen } from '@/components/offsite-screen';
import { useContentWidth, useOffsiteTheme } from '@/theme';

export function OnboardingView({ people, selected, onSelect, onContinue, changing, eyebrow }: {
  eyebrow: string;
  people: readonly { id: string; name: string; travelDetail: string }[];
  selected: string | null;
  onSelect: (id: string) => void;
  onContinue: () => void;
  changing: boolean;
}) {
  const { colors } = useOffsiteTheme();
  const width = useContentWidth();
  const selectedPerson = people.find((person) => person.id === selected);
  return <OffsiteScreen standalone={!changing}>
    <Text textStyle={{ color: colors.accent, fontSize: 12, letterSpacing: 1.2, fontWeight: '600' }}>{eyebrow}</Text>
    <Text testID="onboarding-title" textStyle={{ color: colors.text, fontSize: 32, fontWeight: '700', letterSpacing: -1 }}>
      {changing ? 'Choose your attendee' : 'Who’s joining us?'}
    </Text>
    <Text textStyle={{ color: colors.secondaryText, fontSize: 16, lineHeight: 24 }}>Choose your name. We’ll remember you on this phone.</Text>
    <Column spacing={4} style={{ width }}>
      <Text role="footnote" textStyle={{ color: colors.secondaryText }}>Arrival and departure times are local to Oslo.</Text>
      {people.map((person) => <ActionRowControl key={person.id} title={person.name} detail={person.travelDetail} selected={selected === person.id}
        onPress={() => onSelect(person.id)} testID={`attendee-${person.id}`} />)}
    </Column>
    <Button label={selectedPerson ? `Continue as ${selectedPerson.name.split(' ')[0]}` : 'Choose a name to continue'}
      disabled={!selectedPerson} onPress={onContinue} testID="onboarding-continue" style={{ width }} />
    <Text textStyle={{ color: colors.secondaryText, fontSize: 13, lineHeight: 20 }}>No account or password. You can change this later.</Text>
  </OffsiteScreen>;
}
