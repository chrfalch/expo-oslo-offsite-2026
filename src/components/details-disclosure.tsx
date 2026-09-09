import { Collapsible, Column } from '@expo/ui';
import { useState } from 'react';
import { Text } from './text';
import { useOffsiteTheme } from '@/theme';

export type DetailsDisclosureProps = { label: string; details: readonly string[]; width: number };
export function DetailsDisclosure({ label, details, width }: DetailsDisclosureProps) {
  const { colors } = useOffsiteTheme();
  const [open, setOpen] = useState(false);
  return <Collapsible label={label} labelStyle={{ color: colors.accent }} isOpen={open} onOpenChange={setOpen}>
    <Column spacing={12} style={{ width }}>
      {details.map((detail, index) => <Text key={index} textStyle={{ color: colors.secondaryText }}>{detail}</Text>)}
    </Column>
  </Collapsible>;
}
