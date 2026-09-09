import { Text as NativeText } from '@expo/ui';
import { accessibilityAddTraits, font } from '@expo/ui/swift-ui/modifiers';
import { textRole, type TextProps } from './text.types';

const weights = { normal: 'regular', bold: 'bold', '100': 'ultraLight', '200': 'thin', '300': 'light', '400': 'regular', '500': 'medium', '600': 'semibold', '700': 'bold', '800': 'heavy', '900': 'black' } as const;

export function Text({ role, textStyle, modifiers = [], ...props }: TextProps) {
  const { fontSize, fontWeight, lineHeight: _lineHeight, letterSpacing: _tracking, ...style } = textStyle ?? {};
  const resolvedRole = role ?? textRole(fontSize);
  const heading = resolvedRole.includes('Title') || resolvedRole.startsWith('title') || resolvedRole === 'headline';
  return <NativeText {...props} textStyle={style} modifiers={[
    font({ textStyle: resolvedRole, weight: fontWeight ? weights[fontWeight] : undefined }),
    ...(heading ? [accessibilityAddTraits(['isHeader'])] : []),
    ...modifiers,
  ]} />;
}
