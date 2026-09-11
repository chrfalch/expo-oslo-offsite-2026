import { accessibilityAddTraits, accessibilityElement, accessibilityIdentifier, accessibilityLabel, accessibilityValue, contentShape, controlSize, frame, shapes } from '@expo/ui/swift-ui/modifiers';

export function controlModifiers(label?: string, selected?: boolean, testID?: string, compact = false) {
  return [controlSize(compact ? 'regular' : 'large'), ...(label ? [accessibilityElement('ignore'), accessibilityLabel(label), accessibilityAddTraits(['isButton'])] : []),
    ...(testID ? [accessibilityIdentifier(testID)] : []),
    ...(selected === undefined ? [] : [accessibilityValue(selected ? 'Selected' : 'Not selected'), ...(selected ? [accessibilityAddTraits(['isSelected'])] : [])])];
}
export function rowModifiers(label: string, selected?: boolean, testID?: string) {
  return [accessibilityElement('ignore'), accessibilityLabel(label), accessibilityAddTraits(['isButton']),
    ...(testID ? [accessibilityIdentifier(testID)] : []),
    ...(selected === undefined ? [] : [accessibilityValue(selected ? 'Selected' : 'Not selected'), ...(selected ? [accessibilityAddTraits(['isSelected'])] : [])])];
}
export function rowContentModifiers(width: number) { return [frame({ width }), frame({ minHeight: 44, alignment: 'leading' }), contentShape(shapes.rectangle())]; }
