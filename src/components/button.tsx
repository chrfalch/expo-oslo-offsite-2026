import { Button as NativeButton, type ButtonProps as NativeButtonProps } from '@expo/ui';
import { controlModifiers } from './control-modifiers';

export type ButtonProps = NativeButtonProps & { accessibilityLabel?: string; selected?: boolean };
export function Button({ accessibilityLabel, selected, modifiers = [], ...props }: ButtonProps) {
  return <NativeButton {...props} modifiers={[...controlModifiers(accessibilityLabel, selected, props.testID), ...modifiers]} />;
}
