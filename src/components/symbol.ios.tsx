import { Icon } from '@expo/ui';
import { accessibilityHidden } from '@expo/ui/swift-ui/modifiers';
import type { SymbolProps } from './symbol';

export function SystemSymbol({ name, color }: SymbolProps) {
  return <Icon name={name} color={color} size={22} modifiers={[accessibilityHidden(true)]} />;
}
