import { textSelection } from '@expo/ui/swift-ui/modifiers';
import { Text } from './text';
import type { SelectableTextProps } from './selectable-text';

export function SelectableText({ width: _width, ...props }: SelectableTextProps) {
  return <Text {...props} modifiers={[textSelection(true)]} />;
}
