import { Column, Row } from '@expo/ui';
import { Text } from '@/components/text';
import type { PropsWithChildren, ReactNode } from 'react';
import { useWindowDimensions } from 'react-native';

import { layout, useContentWidth, useOffsiteTheme } from '@/theme';

type InfoCardProps = PropsWithChildren<{
  title: string;
  description: string;
  eyebrow?: string;
  leading?: ReactNode;
  headerTrailing?: ReactNode;
  headerTrailingWidth?: number;
}>;

export function InfoCard({ title, description, eyebrow, leading, headerTrailing, headerTrailingWidth = 0, children }: InfoCardProps) {
  const { colors } = useOffsiteTheme();
  const contentWidth = useContentWidth();
  const { fontScale } = useWindowDimensions();
  const innerWidth = contentWidth - 44;
  const stackHeaderTrailing = Boolean(headerTrailing && fontScale > 1.3);
  const titleWidth = innerWidth - (leading ? 68 : 0) - (headerTrailing && !stackHeaderTrailing ? headerTrailingWidth + 12 : 0);

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
      <Row spacing={12} alignment="center" style={{ width: innerWidth }}>
        {leading}
        <Column style={{ width: titleWidth }}>
          <Text role="title2" textStyle={{ fontWeight: '600', color: colors.text }}>{title}</Text>
        </Column>
        {stackHeaderTrailing ? null : headerTrailing}
      </Row>
      {stackHeaderTrailing ? <Row spacing={0} style={{ width: innerWidth }}>
        <Column style={{ width: innerWidth - headerTrailingWidth }} />
        {headerTrailing}
      </Row> : null}
      <Text textStyle={{ fontSize: 16, lineHeight: 24, color: colors.secondaryText }}>
        {description}
      </Text>
      {children}
    </Column>
  );
}
