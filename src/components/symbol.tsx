import { Icon } from '@expo/ui';
import { Platform } from 'react-native';
import { Text } from './text';

export type SymbolProps = { name: 'chevron.right' | 'circle' | 'checkmark.circle.fill' | 'person.crop.circle' | 'bookmark' | 'bookmark.fill' | 'hand.wave.fill'; color: string; size?: number };
export function SystemSymbol({ name, color, size = 22 }: SymbolProps) {
  if (Platform.OS === 'android' && name === 'person.crop.circle') {
    return <Icon name={require('../../assets/icons/account-circle.xml')} color={color} size={size} accessibilityLabel="Your profile" />;
  }
  return <Text textStyle={{ color, fontSize: size }}>{({ 'chevron.right': '›', circle: '○', 'checkmark.circle.fill': '✓', 'person.crop.circle': '●', bookmark: '☆', 'bookmark.fill': '★', 'hand.wave.fill': '👋' })[name]}</Text>;
}
