import { Column, Row } from '@expo/ui';
import type { ReactNode } from 'react';
import { rowContentModifiers, rowModifiers } from './control-modifiers';
import { RowButton } from './row-button';
import { SystemSymbol } from './symbol';
import { Text } from './text';
import { useContentWidth, useOffsiteTheme } from '@/theme';

export function ActionRowControl({ title, detail, leading, onPress, testID, selected, width: suppliedWidth }: {
  title: string; detail?: string; leading?: ReactNode; onPress: () => void; testID: string; selected?: boolean; width?: number;
}) {
  const defaultWidth = useContentWidth();
  const width = suppliedWidth ?? defaultWidth;
  const { colors } = useOffsiteTheme();
  return <RowButton variant="text" onPress={onPress} testID={testID} modifiers={rowModifiers([title, detail].filter(Boolean).join(', '), selected, testID)}>
    <Row alignment="center" spacing={12} style={{ width, paddingVertical: 10 }} modifiers={rowContentModifiers(width)}>
      {leading}
      {selected !== undefined ? <Column style={{ width: 28 }}><SystemSymbol name={selected ? 'checkmark.circle.fill' : 'circle'} color={selected ? colors.accent : colors.secondaryText} /></Column> : null}
      <Column spacing={4} style={{ width: width - (selected === undefined ? 34 : 40) - (leading ? 56 : 0) }}>
        <Text role="body" textStyle={{ fontWeight: '600', color: colors.text }}>{title}</Text>
        {detail ? <Text role="subheadline" textStyle={{ color: colors.secondaryText }}>{detail}</Text> : null}
      </Column>
      {selected === undefined ? <Column style={{ width: 22 }}><SystemSymbol name="chevron.right" color={colors.secondaryText} /></Column> : null}
    </Row>
  </RowButton>;
}
