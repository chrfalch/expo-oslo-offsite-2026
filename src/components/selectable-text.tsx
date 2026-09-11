import { RNHostView } from '@expo/ui';
import { Text } from 'react-native';
import type { TextProps } from './text.types';

export type SelectableTextProps = Pick<TextProps, 'children' | 'textStyle' | 'testID'> & { width: number };

export function SelectableText({ children, textStyle, testID, width }: SelectableTextProps) {
  // The installed Expo UI Compose Text does not expose text selection yet.
  return <RNHostView matchContents style={{ width }}>
    <Text selectable testID={testID} style={{ ...textStyle, width }}>{children}</Text>
  </RNHostView>;
}
