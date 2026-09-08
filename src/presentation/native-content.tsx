import { Column, Host } from '@expo/ui';
import { useState, type PropsWithChildren } from 'react';

import { offsiteScreenModifiers } from '@/components/offsite-screen-modifiers';
import { useOffsiteTheme } from '@/theme';

/** The boundary between responsive RN layout and native SwiftUI / Compose content. */
export function NativeContent({ children, centered = false }: PropsWithChildren<{ centered?: boolean }>) {
  const { colors, scheme } = useOffsiteTheme();
  const [contentWidth, setContentWidth] = useState<number>();
  return (
    <Host
      matchContents={{ vertical: true }}
      ignoreSafeArea="all"
      colorScheme={scheme}
      seedColor={colors.accent}
      onLayout={(event) => setContentWidth(event.nativeEvent.layout.width)}
      style={{ width: '100%' }}>
      <Column
        alignment={centered ? 'center' : 'start'}
        style={{ width: contentWidth }}
        modifiers={offsiteScreenModifiers}>
        {children}
      </Column>
    </Host>
  );
}
