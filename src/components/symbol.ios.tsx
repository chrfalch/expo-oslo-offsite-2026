import { Icon } from '@expo/ui';
import { accessibilityHidden } from '@expo/ui/swift-ui/modifiers';
import type { SymbolProps } from './symbol';

export function SystemSymbol({ name, color, size = 22 }: SymbolProps) {
  return <Icon name={name} color={color} size={size} modifiers={[accessibilityHidden(true)]} />;
}
