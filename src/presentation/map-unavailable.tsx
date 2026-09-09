import { Text } from '@/components/text';
import { View } from 'react-native';
import { NativeContent } from '@/presentation/native-content';
import { useOffsiteTheme } from '@/theme';

export function MapUnavailable() {
  const { colors } = useOffsiteTheme();
  return <View style={{ flex: 1, padding: 24, justifyContent: 'center', backgroundColor: colors.surface }}><NativeContent centered>
    <Text textStyle={{ color: colors.text, fontSize: 20, fontWeight: '600' }}>Map unavailable on this device</Text>
    <Text textStyle={{ color: colors.secondaryText, fontSize: 15 }}>Open your Maps app using the button below.</Text>
  </NativeContent></View>;
}
