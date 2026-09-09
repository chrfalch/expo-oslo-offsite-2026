import { Column } from '@expo/ui';
import { DisclosureGroup } from '@expo/ui/swift-ui';
import { frame } from '@expo/ui/swift-ui/modifiers';
import { useState } from 'react';
import type { DetailsDisclosureProps } from './details-disclosure';
import { Text } from './text';
import { useOffsiteTheme } from '@/theme';

export function DetailsDisclosure({ label, details, width }: DetailsDisclosureProps) {
  const { colors } = useOffsiteTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  return <DisclosureGroup isExpanded={isExpanded} onIsExpandedChange={setIsExpanded} modifiers={[frame({ width })]}>
    <DisclosureGroup.Label><Text textStyle={{ color: colors.accent }} modifiers={[frame({ minHeight: 44, alignment: 'leading' })]}>{label}</Text></DisclosureGroup.Label>
    <Column spacing={12} style={{ width: width - 20, paddingVertical: 8 }}>
      {details.map((detail, index) => <Text key={index} textStyle={{ color: colors.secondaryText }}>{detail}</Text>)}
    </Column>
  </DisclosureGroup>;
}
