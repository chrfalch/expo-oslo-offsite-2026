import { Text } from './text';

export type SymbolProps = { name: 'chevron.right' | 'circle' | 'checkmark.circle.fill' | 'person.crop.circle' | 'bookmark' | 'bookmark.fill'; color: string };
export function SystemSymbol({ name, color }: SymbolProps) {
  return <Text textStyle={{ color, fontSize: 22 }}>{({ 'chevron.right': '›', circle: '○', 'checkmark.circle.fill': '✓', 'person.crop.circle': '●', bookmark: '☆', 'bookmark.fill': '★' })[name]}</Text>;
}
