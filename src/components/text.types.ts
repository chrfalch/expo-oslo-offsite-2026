import type { TextProps as NativeTextProps } from '@expo/ui';

export const typeSizes = { largeTitle: 34, title: 28, title2: 22, title3: 20, headline: 17, body: 17, callout: 16, subheadline: 15, footnote: 13, caption: 12, caption2: 11 } as const;
export type TextRole = keyof typeof typeSizes;
export type TextProps = NativeTextProps & { role?: TextRole };

// Preserve the existing hierarchy while moving older numeric styles onto Dynamic Type.
export function textRole(size = 17): TextRole {
  if (size >= 32) return 'largeTitle';
  if (size >= 28) return 'title';
  if (size >= 22) return 'title2';
  if (size >= 20) return 'title3';
  if (size >= 17) return 'body';
  if (size >= 16) return 'callout';
  if (size >= 14) return 'subheadline';
  if (size >= 13) return 'footnote';
  return size >= 12 ? 'caption' : 'caption2';
}
