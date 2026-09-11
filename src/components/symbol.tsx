import { Icon } from '@expo/ui';
import { Platform } from 'react-native';
import { Text } from './text';

export type SymbolProps = { name: 'chevron.right' | 'circle' | 'checkmark.circle.fill' | 'person.crop.circle' | 'bookmark' | 'bookmark.fill' | 'hand.wave.fill' | 'map' | 'mappin.and.ellipse' | 'star' | 'star.fill'; color: string; size?: number };
export function SystemSymbol({ name, color, size = 22 }: SymbolProps) {
  if (Platform.OS === 'android') {
    if (name === 'person.crop.circle') {
      return <Icon name={require('../../assets/icons/account-circle.xml')} color={color} size={size} accessibilityLabel="Your profile" />;
    }
    if (name === 'map') {
      return <Icon name={require('../../assets/icons/map.xml')} color={color} size={size} />;
    }
    if (name === 'mappin.and.ellipse') {
      return <Icon name={require('../../assets/icons/location-pin.xml')} color={color} size={size} />;
    }
    if (name === 'star') {
      return <Icon name={require('../../assets/icons/star.xml')} color={color} size={size} />;
    }
    if (name === 'star.fill') {
      return <Icon name={require('../../assets/icons/star-filled.xml')} color={color} size={size} />;
    }
  }
  return <Text textStyle={{ color, fontSize: size }}>{({ 'chevron.right': '›', circle: '○', 'checkmark.circle.fill': '✓', 'person.crop.circle': '●', bookmark: '☆', 'bookmark.fill': '★', 'hand.wave.fill': '👋', map: '🗺', 'mappin.and.ellipse': '📍', star: '☆', 'star.fill': '★' })[name]}</Text>;
}
