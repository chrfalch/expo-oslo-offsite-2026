import { Column, Picker } from '@expo/ui';
import { Text } from './text';
import { useOffsiteTheme } from '@/theme';

export type ChoiceControlProps = { id: string; label: string; value: string; options: readonly { value: string; label: string }[]; onChange: (value: string) => void; width: number };
export function ChoiceControl({ id, label, value, options, onChange, width }: ChoiceControlProps) {
  const { colors } = useOffsiteTheme();
  return <Column spacing={6} style={{ width }}><Text role="subheadline" textStyle={{ color: colors.secondaryText }}>{label}</Text>
    <Picker testID={id} selectedValue={value} onValueChange={onChange}>{options.map((item) => <Picker.Item key={item.value} {...item} />)}</Picker>
  </Column>;
}
