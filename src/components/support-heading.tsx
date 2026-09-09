import { Platform } from 'react-native';
import { Text } from './text';

export function SupportHeading({ color }: { color: string }) {
  return <Text role="title" testID="support-footer-heading" textStyle={{ color, fontWeight: '800', textAlign: 'center',
    fontFamily: Platform.OS === 'web' ? 'ui-rounded, system-ui, sans-serif' : 'sans-serif' }}>Need a hand?</Text>;
}
