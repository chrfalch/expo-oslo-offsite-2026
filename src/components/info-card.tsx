import { Column, Row } from '@expo/ui';
import { Text } from '@/components/text';
import type { PropsWithChildren, ReactNode } from 'react';

import { layout, useContentWidth, useOffsiteTheme } from '@/theme';

type InfoCardProps = PropsWithChildren<{
  title: string;
  description: string;
  eyebrow?: string;
  leading?: ReactNode;
}>;

export function InfoCard({ title, description, eyebrow, leading, children }: InfoCardProps) {
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
      <Row spacing={12} alignment="center" style={{ width: contentWidth - 44 }}>
        {leading}
        <Column style={{ width: contentWidth - 44 - (leading ? 68 : 0) }}>
          <Text role="title2" textStyle={{ fontWeight: '600', color: colors.text }}>{title}</Text>
        </Column>
      </Row>
      <Text textStyle={{ fontSize: 16, lineHeight: 24, color: colors.secondaryText }}>
        {description}
      </Text>
      {children}
    </Column>
  );
}
