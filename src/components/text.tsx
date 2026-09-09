import { Text as NativeText } from '@expo/ui';
import { typeSizes, type TextProps } from './text.types';

export function Text({ role, textStyle, ...props }: TextProps) {
  return <NativeText {...props} textStyle={{ ...(role ? { fontSize: typeSizes[role] } : {}), ...textStyle }} />;
}
