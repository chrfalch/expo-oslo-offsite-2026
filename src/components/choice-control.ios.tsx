import { Picker, Text } from '@expo/ui/swift-ui';
import { accessibilityLabel, controlSize, frame, pickerStyle, tag } from '@expo/ui/swift-ui/modifiers';
import { useWindowDimensions } from 'react-native';
import type { ChoiceControlProps } from './choice-control';

export function ChoiceControl({ id, label, value, options, onChange, width }: ChoiceControlProps) {
  const { fontScale } = useWindowDimensions();
  return <Picker label={label} selection={value} onSelectionChange={(next) => onChange(String(next))} testID={id}
    modifiers={[pickerStyle(options.length <= 3 && fontScale <= 1.3 ? 'segmented' : 'menu'), controlSize('large'), frame({ width, alignment: 'leading' }), frame({ minHeight: 44, alignment: 'leading' }), accessibilityLabel(label)]}>
    {options.map((item) => <Text key={item.value} modifiers={[tag(item.value)]}>{item.label}</Text>)}
  </Picker>;
}
