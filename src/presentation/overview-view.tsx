import { Column, Row } from '@expo/ui';
import { Text } from '@/components/text';
import { Button } from '@/components/button';
import { SystemSymbol } from '@/components/symbol';
import { rowContentModifiers } from '@/components/control-modifiers';
import { Image, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActionRow, type ActionRowModel } from '@/presentation/content-page-view';
import { GuideCard, type GuideCardModel } from '@/presentation/guide-card';
import { NativeContent } from '@/presentation/native-content';
import { layout, useOffsiteTheme } from '@/theme';

export type OverviewViewProps = {
  title: string; year: string; dates: string;
  onProfile: () => void; arrival: ActionRowModel; upcoming?: GuideCardModel; rows: readonly ActionRowModel[];
};

export function OverviewView(props: OverviewViewProps) {
  const { colors } = useOffsiteTheme();
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();
  return <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentInsetAdjustmentBehavior="never"
    contentContainerStyle={{ padding: 20, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100 }}>
    <View style={styles.content}>
      <View style={styles.heading}>
        <View style={{ flex: 1 }}><NativeContent><Column spacing={5}>
          <Text testID="overview-title" textStyle={{ fontSize: 31, fontWeight: '700', letterSpacing: -1, color: colors.text }}>{props.title}</Text>
          <Text textStyle={{ fontSize: 14, color: colors.secondaryText }}>{fontScale > 1.3 ? props.dates : 'Your week in Oslo'}</Text>
        </Column></NativeContent></View>
        <View style={{ width: 44 }}><NativeContent><Button accessibilityLabel="Your profile" onPress={props.onProfile} testID="open-profile" variant="text">
          <Row style={{ width: 44 }} modifiers={rowContentModifiers(44)}><SystemSymbol name="person.crop.circle" color={colors.accent} /></Row>
        </Button></NativeContent></View>
      </View>
      {fontScale <= 1.3 ? <View style={[styles.hero, { backgroundColor: colors.hero }]} testID="offsite-hero">
        <View style={{ flex: 1 }}><NativeContent><Column spacing={4}>
          <Text role="title2" textStyle={{ fontWeight: '700', color: colors.heroText }}>Oslo Offsite</Text>
          <Text role="subheadline" textStyle={{ color: colors.heroText }}>{`${props.dates} ${props.year} · Better together.`}</Text>
        </Column></NativeContent></View>
        <View style={styles.logoTile}><Image source={require('../../assets/images/expo-logo.png')} accessibilityLabel="Expo" style={styles.logo} /></View>
      </View> : null}
      <NativeContent><Column spacing={18}>
        <ActionRow row={props.arrival} />
        <Text textStyle={{ fontSize: 18, fontWeight: '600', color: colors.text }}>{props.upcoming ? 'Coming up' : 'Your offsite guide'}</Text>
        {props.upcoming ? <GuideCard card={props.upcoming} /> : <Text textStyle={{ color: colors.secondaryText }}>No more shared activities are listed. Your schedule and city guide are still here.</Text>}
        {props.rows.map((row) => <ActionRow key={row.id} row={row} />)}
      </Column></NativeContent>
    </View>
  </ScrollView>;
}
const styles = StyleSheet.create({
  content: { width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', gap: 18 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  hero: { padding: 18, borderRadius: layout.heroRadius, gap: 12, flexDirection: 'row', alignItems: 'center' },
  logoTile: { width: 38, height: 38, backgroundColor: '#FFFFFF', borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 23, height: 23, tintColor: '#111113', resizeMode: 'contain' },
});
