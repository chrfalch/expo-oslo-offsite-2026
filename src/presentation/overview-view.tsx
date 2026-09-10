import { Column, Row } from '@expo/ui';
import { Text } from '@/components/text';
import { Button } from '@/components/button';
import { SystemSymbol } from '@/components/symbol';
import { SupportHeading } from '@/components/support-heading';
import { rowContentModifiers } from '@/components/control-modifiers';
import { Image, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActionRow, type ActionRowModel } from '@/presentation/content-page-view';
import { UpcomingActivityCard, type UpcomingActivityModel } from '@/presentation/upcoming-activity-card';
import { NativeContent } from '@/presentation/native-content';
import { layout, useOffsiteTheme } from '@/theme';

export type OverviewViewProps = {
  title: string; year: string; dates: string;
  onProfile: () => void; onSupport: () => void; arrival: ActionRowModel; team: readonly ActionRowModel[]; upcoming?: UpcomingActivityModel; rows: readonly ActionRowModel[];
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
        <Column spacing={6}>
          <Text textStyle={{ fontSize: 18, fontWeight: '600', color: colors.text }}>My Team</Text>
          <Text textStyle={{ color: colors.secondaryText }}>Arrivals in Oslo local time</Text>
        </Column>
        <Column spacing={4}>{props.team.map((member) => <ActionRow key={member.id} row={member} />)}</Column>
        <Text textStyle={{ fontSize: 18, fontWeight: '600', color: colors.text }}>{props.upcoming ? 'Coming up' : 'Your offsite guide'}</Text>
        {props.upcoming ? <UpcomingActivityCard activity={props.upcoming} /> : <Text textStyle={{ color: colors.secondaryText }}>No more shared activities are listed. Your schedule and city guide are still here.</Text>}
        {props.rows.map((row) => <ActionRow key={row.id} row={row} />)}
      </Column></NativeContent>
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <View style={[styles.supportBadge, { backgroundColor: colors.autumn }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <NativeContent centered><SystemSymbol name="hand.wave.fill" color={colors.autumnText} size={30} /></NativeContent>
        </View>
        <NativeContent centered><Column alignment="center" spacing={6}>
          <SupportHeading color={colors.text} />
          <Text role="subheadline" textStyle={{ color: colors.secondaryText, textAlign: 'center' }}>Oslo questions. Human answers.</Text>
          <Button accessibilityLabel="Support · Ask Christian" variant="text" onPress={props.onSupport} testID="overview-support">
            <Column style={{ paddingVertical: 12, paddingHorizontal: 16 }}>
              <Text role="subheadline" textStyle={{ color: colors.accent }}>Support · Ask Christian</Text>
            </Column>
          </Button>
        </Column></NativeContent>
      </View>
    </View>
  </ScrollView>;
}
const styles = StyleSheet.create({
  content: { width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', gap: 18 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  footer: { marginTop: 8, paddingTop: 28, borderTopWidth: StyleSheet.hairlineWidth, alignItems: 'center', gap: 14 },
  supportBadge: { width: 58, height: 58, borderRadius: 20, justifyContent: 'center', transform: [{ rotate: '-10deg' }] },
  hero: { padding: 18, borderRadius: layout.heroRadius, gap: 12, flexDirection: 'row', alignItems: 'center' },
  logoTile: { width: 38, height: 38, backgroundColor: '#FFFFFF', borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 23, height: 23, tintColor: '#111113', resizeMode: 'contain' },
});
