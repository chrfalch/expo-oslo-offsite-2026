import { Text } from './text';

export type SymbolProps = { name: 'chevron.right' | 'circle' | 'checkmark.circle.fill' | 'person.crop.circle' | 'bookmark' | 'bookmark.fill' | 'hand.wave.fill'; color: string; size?: number };
export function SystemSymbol({ name, color, size = 22 }: SymbolProps) {
  return <Text textStyle={{ color, fontSize: size }}>{({ 'chevron.right': '›', circle: '○', 'checkmark.circle.fill': '✓', 'person.crop.circle': '●', bookmark: '☆', 'bookmark.fill': '★', 'hand.wave.fill': '👋' })[name]}</Text>;
}
