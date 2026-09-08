import { Column, Host } from '@expo/ui';
import { createContext, use, useCallback, useRef, type PropsWithChildren } from 'react';
import { ScrollView } from 'react-native';

import { offsiteScreenModifiers } from '@/components/offsite-screen-modifiers';
import { layout, useContentWidth, useOffsiteTheme } from '@/theme';

const ScrollToTopContext = createContext(() => {});
export const useScrollToTop = () => use(ScrollToTopContext);

export function OffsiteScreen({ children }: PropsWithChildren) {
  const { colors, scheme } = useOffsiteTheme();
  const contentWidth = useContentWidth();
  const scrollRef = useRef<ScrollView>(null);
  const scrollToTop = useCallback(() => scrollRef.current?.scrollTo({ y: 0, animated: false }), []);

  return (
    <ScrollToTopContext value={scrollToTop}>
      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        style={{ flex: 1, backgroundColor: colors.background }}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: layout.pagePadding, paddingBottom: 40 }}>
        <Host
          matchContents={{ vertical: true }}
          ignoreSafeArea="all"
          colorScheme={scheme}
          seedColor={colors.accent}
          style={{ width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center' }}>
          <Column
            spacing={layout.sectionGap}
            style={{ width: contentWidth }}
            modifiers={offsiteScreenModifiers}>
            {children}
          </Column>
        </Host>
      </ScrollView>
    </ScrollToTopContext>
  );
}
