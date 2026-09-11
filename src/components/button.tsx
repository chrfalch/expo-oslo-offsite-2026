import { Button as NativeButton, type ButtonProps as NativeButtonProps } from '@expo/ui';
import { Platform, useWindowDimensions } from 'react-native';
import { controlModifiers } from './control-modifiers';

export type ButtonProps = NativeButtonProps & { accessibilityLabel?: string; selected?: boolean; compact?: boolean };
export function Button({ accessibilityLabel, selected, compact = false, modifiers = [], ...props }: ButtonProps) {
  const { fontScale } = useWindowDimensions();
  return <NativeButton {...props} style={{ ...(compact && Platform.OS !== 'ios' && fontScale <= 1.3 ? { height: 36 } : {}), ...props.style }} modifiers={[...controlModifiers(accessibilityLabel, selected, props.testID, compact), ...modifiers]} />;
}
