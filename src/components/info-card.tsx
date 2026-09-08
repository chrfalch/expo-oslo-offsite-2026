import { Column, Text } from '@expo/ui';
import type { PropsWithChildren } from 'react';

import { layout, useContentWidth, useOffsiteTheme } from '@/theme';

type InfoCardProps = PropsWithChildren<{
  title: string;
  description: string;
  eyebrow?: string;
}>;

export function InfoCard({ title, description, eyebrow, children }: InfoCardProps) {
  const { colors } = useOffsiteTheme();
  const contentWidth = useContentWidth();

  return (
    <Column
      spacing={12}
      style={{
        // The SDK 58 canary's SwiftUI adapter currently accepts numeric frame widths.
        width: contentWidth,
        padding: 22,
        borderRadius: layout.cardRadius,
        backgroundColor: colors.surface,
      }}>
      {eyebrow ? (
        <Text textStyle={{ fontSize: 12, fontWeight: '700', letterSpacing: 1.4, color: colors.accent }}>
          {eyebrow}
        </Text>
      ) : null}
      <Text textStyle={{ fontSize: 22, fontWeight: '600', color: colors.text }}>
        {title}
      </Text>
      <Text textStyle={{ fontSize: 16, lineHeight: 24, color: colors.secondaryText }}>
        {description}
      </Text>
      {children}
    </Column>
  );
}
