import type { ButtonProps } from '@expo/ui';
import { Shape, TextButton } from '@expo/ui/jetpack-compose';
import { testID as testIDModifier } from '@expo/ui/jetpack-compose/modifiers';

export function RowButton({ children, onPress, testID, modifiers = [] }: ButtonProps) {
  return <TextButton onClick={onPress} contentPadding={{ start: 0, end: 0 }}
    shape={Shape.RoundedCorner({ cornerRadii: { topStart: 14, topEnd: 14, bottomStart: 14, bottomEnd: 14 } })}
    modifiers={[...(testID ? [testIDModifier(testID)] : []), ...modifiers]}>
    {children}
  </TextButton>;
}
