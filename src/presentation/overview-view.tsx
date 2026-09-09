import { Button, Column, Text } from '@expo/ui';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActionRow, type ActionRowModel } from '@/presentation/content-page-view';
import { GuideCard, type GuideCardModel } from '@/presentation/guide-card';
import { NativeContent } from '@/presentation/native-content';
import { layout, useOffsiteTheme } from '@/theme';

export type OverviewViewProps = {
  title: string; initials: string; season: string; destination: string; year: string; dates: string;
  onProfile: () => void; arrival: ActionRowModel; upcoming?: GuideCardModel; rows: readonly ActionRowModel[];
};

export function OverviewView(props: OverviewViewProps) {
  const { colors } = useOffsiteTheme();
  const insets = useSafeAreaInsets();
  return <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentInsetAdjustmentBehavior="never"
    contentContainerStyle={{ padding: 20, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100 }}>
    <View style={styles.content}>
      <View style={styles.heading}>
        <View style={{ flex: 1 }}><NativeContent><Column spacing={5}>
          <Text testID="overview-title" textStyle={{ fontSize: 31, fontWeight: '700', letterSpacing: -1, color: colors.text }}>{props.title}</Text>
          <Text textStyle={{ fontSize: 14, color: colors.secondaryText }}>Your week in Oslo</Text>
        </Column></NativeContent></View>
        <View style={{ width: 58 }}><NativeContent><Button label={props.initials} onPress={props.onProfile} testID="open-profile" variant="outlined" /></NativeContent></View>
      </View>
      <View style={[styles.hero, { backgroundColor: colors.hero }]} testID="offsite-hero">
        <View style={styles.heading}>
          <View style={{ flex: 1 }}><NativeContent><Text textStyle={{ fontSize: 11, letterSpacing: 1.1, fontWeight: '600', color: colors.heroText }}>{`${props.season} / ${props.destination}`}</Text></NativeContent></View>
          <View style={styles.logoTile}><Image source={require('../../assets/images/expo-logo.png')} accessibilityLabel="Expo" style={styles.logo} /></View>
        </View>
        <NativeContent><Text textStyle={{ fontSize: 37, fontWeight: '800', letterSpacing: -1.6, color: colors.heroText }}>OSLO OFFSITE</Text></NativeContent>
        <View style={styles.heroFooter}>
          <View style={{ flex: 1 }}><NativeContent><Text textStyle={{ fontSize: 14, color: colors.heroText }}>{props.dates}</Text><Text textStyle={{ fontSize: 14, color: colors.heroText }}>Better together.</Text></NativeContent></View>
          <View style={[styles.year, { backgroundColor: colors.autumn }]}><NativeContent centered><Text textStyle={{ fontSize: 27, fontWeight: '700', color: colors.autumnText }}>{props.year}</Text></NativeContent></View>
        </View>
      </View>
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
  hero: { padding: 20, borderRadius: layout.heroRadius, gap: 12 },
  logoTile: { width: 38, height: 38, backgroundColor: '#FFFFFF', borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 23, height: 23, tintColor: '#111113', resizeMode: 'contain' },
  heroFooter: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 2 },
  year: { width: 62, height: 62, borderRadius: 62, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '12deg' }] },
});
