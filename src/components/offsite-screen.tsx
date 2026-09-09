import { Column, Host } from '@expo/ui';
import { createContext, use, useCallback, useRef, type PropsWithChildren } from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { offsiteScreenModifiers } from '@/components/offsite-screen-modifiers';
import { useScreenObserve } from '@/screens/use-screen-observe';
import { layout, useContentWidth, useOffsiteTheme } from '@/theme';

const ScrollToTopContext = createContext(() => {});
export const useScrollToTop = () => use(ScrollToTopContext);

export function OffsiteScreen({ children, standalone = false }: PropsWithChildren<{ standalone?: boolean }>) {
  useScreenObserve();
  const { colors, scheme } = useOffsiteTheme();
  const contentWidth = useContentWidth();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const scrollToTop = useCallback(() => scrollRef.current?.scrollTo({ y: 0, animated: false }), []);

  return (
    <ScrollToTopContext value={scrollToTop}>
      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
        style={{ flex: 1, backgroundColor: colors.background }}
        contentInsetAdjustmentBehavior={standalone ? 'never' : 'automatic'}
        contentContainerStyle={{ padding: layout.pagePadding, paddingTop: standalone ? insets.top + 20 : 20, paddingBottom: insets.bottom + 40 }}>
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
