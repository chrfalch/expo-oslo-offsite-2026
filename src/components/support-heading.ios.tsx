import { font } from '@expo/ui/swift-ui/modifiers';
import { Text } from './text';

export function SupportHeading({ color }: { color: string }) {
  return <Text role="title" testID="support-footer-heading" textStyle={{ color, textAlign: 'center' }}
    modifiers={[font({ textStyle: 'title', design: 'rounded', weight: 'heavy' })]}>Need a hand?</Text>;
}
