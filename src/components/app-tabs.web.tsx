import { TabList, TabSlot, Tabs, TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, Text, View } from 'react-native';

import { useOffsiteTheme } from '@/theme';

function TabButton({ children, isFocused, ...props }: Omit<TabTriggerSlotProps, 'ref'>) {
  const { colors } = useOffsiteTheme();

  return (
    <Pressable
      {...props}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      style={({ pressed }) => ({
        flex: 1,
        minHeight: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 24,
        backgroundColor: isFocused ? colors.accentSoft : 'transparent',
        opacity: pressed ? 0.7 : 1,
      })}>
      <Text style={{ color: isFocused ? colors.accent : colors.secondaryText, fontWeight: '600' }}>
        {children}
      </Text>
    </Pressable>
  );
}

export default function AppTabs() {
  const { colors } = useOffsiteTheme();

  return (
    <Tabs style={{ flex: 1, backgroundColor: colors.background }}>
      <TabSlot style={{ flex: 1 }} />
      <TabList asChild>
        <View
          style={{
            flexDirection: 'row',
            alignSelf: 'center',
            width: '100%',
            maxWidth: 600,
            padding: 8,
            gap: 8,
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderColor: colors.border,
          }}>
          <TabTrigger name="overview" href="/" asChild>
            <TabButton>Overview</TabButton>
          </TabTrigger>
          <TabTrigger name="schedule" href="/schedule" asChild>
            <TabButton>Schedule</TabButton>
          </TabTrigger>
          <TabTrigger name="oslo" href="/oslo" asChild>
            <TabButton>Oslo</TabButton>
          </TabTrigger>
        </View>
      </TabList>
    </Tabs>
  );
}
