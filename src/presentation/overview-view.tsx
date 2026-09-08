import { Column, Text } from '@expo/ui';
import { Image, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NativeContent } from '@/presentation/native-content';
import { layout, useOffsiteTheme } from '@/theme';

export type OverviewViewProps = {
  title: string;
  season: string;
  destination: string;
  year: string;
  planSubtitle: string;
  citySubtitle: string;
  onOpenPlan: () => void;
  onOpenCity: () => void;
};

/** Display-ready strings and actions only; no data, selectors or navigation dependencies. */
export function OverviewView(props: OverviewViewProps) {
  const { colors } = useOffsiteTheme();
  const insets = useSafeAreaInsets();
  const { width, fontScale } = useWindowDimensions();
  const heroFontSize = Math.min(71, (Math.min(width, layout.maxWidth + 40) - 84) / 4.55);
  const stackCards = width < 360 || fontScale > 1.3;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentInsetAdjustmentBehavior="never"
      contentContainerStyle={{ padding: layout.pagePadding, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100 }}>
      <View style={styles.content}>
        <View style={styles.heading}>
          <View style={{ flex: 1 }}>
            <NativeContent>
              <Text textStyle={{ fontSize: 31, fontWeight: '700', letterSpacing: -1, color: colors.text }}>
                {props.title}
              </Text>
            </NativeContent>
          </View>
          <View style={styles.logoTile}>
            <Image source={require('../../assets/images/expo-logo.png')} accessibilityLabel="Expo" style={styles.logo} />
          </View>
        </View>

        <View style={[styles.hero, { backgroundColor: colors.hero }]} testID="offsite-hero">
          <View pointerEvents="none" accessible={false} style={[styles.orbit, { borderColor: colors.heroText }]} />
          <View pointerEvents="none" accessible={false} style={[styles.orbit, styles.secondOrbit, { borderColor: colors.heroText }]} />
          <NativeContent>
            <Column spacing={20}>
              <Text textStyle={{ fontSize: 11, fontWeight: '600', letterSpacing: 1.3, color: colors.heroText }}>
                {`${props.season} / ${props.destination}`}
              </Text>
              <Column spacing={-14}>
                {['OSLO', 'OFFSITE'].map((word) => (
                  <Text key={word} textStyle={{ fontSize: heroFontSize, fontWeight: '800', letterSpacing: -3.8, color: colors.heroText }}>
                    {word}
                  </Text>
                ))}
              </Column>
            </Column>
          </NativeContent>
          <View style={styles.heroFooter}>
            <View style={{ flex: 1 }}>
              <NativeContent>
                <Text textStyle={{ fontSize: 15, fontWeight: '500', color: colors.heroText }}>Better together.</Text>
              </NativeContent>
            </View>
            <View style={[styles.year, { backgroundColor: colors.autumn }]}>
              <NativeContent centered>
                <Text textStyle={{ fontSize: 31, fontWeight: '800', letterSpacing: -1, color: colors.autumnText }}>
                  {props.year}
                </Text>
              </NativeContent>
            </View>
          </View>
        </View>

        <View style={[styles.cards, stackCards && { flexDirection: 'column' }]}>
          <NavigationCard symbol="calendar" title="The plan" subtitle={props.planSubtitle} onPress={props.onOpenPlan} />
          <NavigationCard symbol="pin" title="The city" subtitle={props.citySubtitle} onPress={props.onOpenCity} />
        </View>
      </View>
    </ScrollView>
  );
}

function NavigationCard({ symbol, title, subtitle, onPress }: {
  symbol: 'calendar' | 'pin'; title: string; subtitle: string; onPress: () => void;
}) {
  const { colors } = useOffsiteTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${subtitle}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, { backgroundColor: colors.surface, opacity: pressed ? 0.65 : 1 }]}>
      <View accessible={false} style={{ height: 30 }}>
        {symbol === 'calendar' ? (
          <View style={[styles.calendar, { borderColor: colors.text }]}>
            <View style={{ height: 6, borderBottomWidth: 1.8, borderColor: colors.text }} />
            <View style={{ width: 4, height: 4, margin: 4, backgroundColor: colors.text, borderRadius: 1 }} />
          </View>
        ) : (
          <View style={[styles.pin, { borderColor: colors.text }]}>
            <View style={{ width: 5, height: 5, borderRadius: 5, backgroundColor: colors.text }} />
          </View>
        )}
      </View>
      <View pointerEvents="none">
        <NativeContent>
          <Column spacing={5}>
            <Text textStyle={{ fontSize: 20, fontWeight: '700', letterSpacing: -0.5, color: colors.text }}>{title}</Text>
            <Text textStyle={{ fontSize: 13, lineHeight: 18, color: colors.secondaryText }}>{subtitle}</Text>
          </Column>
        </NativeContent>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', gap: layout.sectionGap },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  logoTile: { width: 42, height: 42, borderRadius: 13, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  logo: { width: 24, height: 24, resizeMode: 'contain', tintColor: '#111113' },
  hero: { padding: 22, paddingBottom: 17, minHeight: 263, borderRadius: layout.heroRadius, overflow: 'hidden' },
  orbit: { position: 'absolute', top: -44, right: -26, width: 137, height: 137, borderRadius: 100, borderWidth: 1.5, opacity: 0.22 },
  secondOrbit: { top: -27, right: -42 },
  heroFooter: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, marginTop: 20, minHeight: 40, paddingRight: 90 },
  year: { position: 'absolute', right: 0, bottom: 0, width: 76, height: 76, borderRadius: 76, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '13deg' }] },
  cards: { flexDirection: 'row', gap: 12 },
  card: { flex: 1, minHeight: 135, padding: 18, borderRadius: layout.cardRadius, gap: 11 },
  calendar: { width: 21, height: 22, borderWidth: 1.8, borderRadius: 4, marginTop: 2 },
  pin: { width: 20, height: 24, borderWidth: 1.8, borderRadius: 12, borderBottomRightRadius: 2, transform: [{ rotate: '45deg' }], alignItems: 'center', justifyContent: 'center', marginLeft: 2 },
});
