import { Shape, TextButton } from '@expo/ui/jetpack-compose';
import { testID as testIDModifier } from '@expo/ui/jetpack-compose/modifiers';

import type { ButtonProps } from './button';
import { layout } from '@/theme';

export function CardButton({ children, onPress, testID }: ButtonProps) {
  const radius = layout.cardRadius;
  return <TextButton onClick={onPress} contentPadding={{ start: 0, top: 0, end: 0, bottom: 0 }}
    shape={Shape.RoundedCorner({ cornerRadii: { topStart: radius, topEnd: radius, bottomStart: radius, bottomEnd: radius } })}
    modifiers={testID ? [testIDModifier(testID)] : []}>
    {children}
  </TextButton>;
}
