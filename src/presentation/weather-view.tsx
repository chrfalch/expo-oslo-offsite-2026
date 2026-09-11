import { Column, Row } from '@expo/ui';
import { useState } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/button';
import { CardButton } from '@/components/card-button';
import { rowContentModifiers } from '@/components/control-modifiers';
import { Text } from '@/components/text';
import { NativeContent } from '@/presentation/native-content';
import { layout, useContentWidth, useOffsiteTheme } from '@/theme';

export type WeatherHourModel = { id: string; time: string; emoji: string; temperature: string; condition: string; wind: string; precipitation: string };
export type WeatherDayModel = { date: string; isToday: boolean; title: string; subtitle: string; emoji: string; condition: string; range: string; detail: string; hours: readonly WeatherHourModel[] };

export type WeatherModel = {
  loading: boolean;
  temperature: string;
  condition: string;
  emoji: string;
  detail: string;
  status: string;
  days: readonly WeatherDayModel[];
};

function WeatherHours({ hours, hero = false }: { hours: readonly WeatherHourModel[]; hero?: boolean }) {
  const { colors } = useOffsiteTheme();
  const { fontScale } = useWindowDimensions();
  const color = hero ? colors.heroText : colors.text;
  if (hours.length === 0) return <NativeContent><Text role="subheadline" textStyle={{ color }}>No forecast times available.</Text></NativeContent>;
  return <ScrollView horizontal showsHorizontalScrollIndicator accessibilityLabel="Forecast by time of day" testID={hero ? 'weather-today-hours' : 'weather-expanded-hours'}
    contentContainerStyle={{ gap: 12, paddingBottom: 10 }}>
    {hours.map((hour) => <View key={hour.id} style={{ width: fontScale > 1.3 ? 190 : 104, paddingVertical: 12, paddingHorizontal: 10, borderRadius: 16, backgroundColor: hero ? colors.hero : colors.background }}>
      <NativeContent><Column spacing={8}>
        <Text role="subheadline" textStyle={{ color, fontWeight: '600' }}>{hour.time}</Text>
        <Text role="title2" textStyle={{ color }}>{hour.emoji || '—'}</Text>
        <Text role="title2" textStyle={{ color, fontWeight: '600' }}>{hour.temperature}</Text>
        <Text role="caption" textStyle={{ color }}>{hour.condition}</Text>
        <Text role="caption" textStyle={{ color }}>{hour.wind}</Text>
        <Text role="caption" textStyle={{ color }}>{hour.precipitation}</Text>
      </Column></NativeContent>
    </View>)}
  </ScrollView>;
}

function WeatherDayRow({ day, first }: { day: WeatherDayModel; first: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const { colors } = useOffsiteTheme();
  const { fontScale } = useWindowDimensions();
  const width = useContentWidth() - 36;
  return <View testID={`weather-day-${day.date}`} style={{ borderTopWidth: first ? 0 : 0.5, borderTopColor: colors.border }}>
    <NativeContent><CardButton onPress={() => setExpanded((value) => !value)} testID={`weather-toggle-${day.date}`}
      accessibilityLabel={`${day.title}, ${day.subtitle}, ${day.condition}, ${day.range}. ${expanded ? 'Hide' : 'Show'} forecast by time of day`}>
      <Column spacing={7} style={{ width, paddingVertical: 16 }} modifiers={rowContentModifiers(width)}>
        {fontScale > 1.3 ? <Column spacing={6} style={{ width }}>
          <Text role="headline" textStyle={{ color: colors.text, fontWeight: '600' }}>{day.title}</Text>
          <Text role="headline" textStyle={{ color: colors.text }}>{`${day.emoji} ${day.range}`}</Text>
        </Column> : <Row spacing={8} style={{ width }}>
          <Column style={{ width: width - 136 }}><Text role="headline" textStyle={{ color: colors.text, fontWeight: '600' }}>{day.title}</Text></Column>
          <Text role="headline" textStyle={{ color: colors.text }}>{`${day.emoji} ${day.range}`}</Text>
        </Row>}
        <Text role="caption" textStyle={{ color: colors.secondaryText }}>{day.subtitle}</Text>
        <Text role="subheadline" textStyle={{ color: colors.text }}>{day.condition}</Text>
        {day.detail ? <Text role="caption" textStyle={{ color: colors.secondaryText }}>{day.detail}</Text> : null}
        <Text role="caption" textStyle={{ color: colors.accent }}>{expanded ? 'Hide times ⌃' : 'See times ⌄'}</Text>
      </Column>
    </CardButton></NativeContent>
    {expanded ? <View style={{ paddingBottom: 16 }}><WeatherHours hours={day.hours} /></View> : null}
  </View>;
}

export function WeatherSummary({ weather, onMore }: { weather: WeatherModel; onMore: () => void }) {
  const { colors } = useOffsiteTheme();
  const { fontScale } = useWindowDimensions();
  return <View style={{ gap: 2 }} testID="overview-weather">
    <View style={{ flexDirection: fontScale > 1.3 ? 'column' : 'row', alignItems: fontScale > 1.3 ? 'flex-start' : 'center', gap: 8 }}>
      <View style={{ flex: fontScale > 1.3 ? undefined : 1, width: fontScale > 1.3 ? '100%' : undefined }}><NativeContent><Column spacing={4}>
        <Text role="caption" textStyle={{ color: colors.heroText }}>Oslo today</Text>
        <Text role="headline" textStyle={{ color: colors.heroText, fontWeight: '600' }}>{weather.loading ? 'Loading weather…' : `${weather.emoji} ${weather.temperature}${weather.temperature ? ' · ' : ''}${weather.condition}`}</Text>
      </Column></NativeContent></View>
      <View style={{ width: fontScale > 1.3 ? '100%' : 76 }}><NativeContent><Button variant="text" accessibilityLabel="See more weather · next seven days" testID="weather-see-more" onPress={onMore}>
        <Column style={{ paddingVertical: 12, paddingHorizontal: 4 }}><Text role="footnote" textStyle={{ color: colors.heroText }}>see more</Text></Column>
      </Button></NativeContent></View>
    </View>
    {weather.status ? <NativeContent><Text role="caption" textStyle={{ color: colors.heroText }}>{weather.status}</Text></NativeContent> : null}
  </View>;
}

export function WeatherView({ weather, onRetry, onSource, onLicense, linkError }: {
  weather: WeatherModel; onRetry: () => void; onSource: () => void; onLicense: () => void; linkError?: string;
}) {
  const { colors } = useOffsiteTheme();
  const insets = useSafeAreaInsets();
  const today = weather.days.find((day) => day.isToday);
  const upcomingDays = weather.days.filter((day) => !day.isToday);
  return <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentInsetAdjustmentBehavior="automatic"
    contentContainerStyle={{ padding: layout.pagePadding, paddingBottom: insets.bottom + 32 }}>
    <View style={{ width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', gap: 20 }}>
      <View style={{ padding: 22, gap: 18, borderRadius: layout.heroRadius, backgroundColor: colors.hero }} testID="weather-current">
        <NativeContent><Column spacing={8}>
          <Text role="subheadline" textStyle={{ color: colors.heroText }}>Oslo · Today</Text>
          <Text role="largeTitle" textStyle={{ color: colors.heroText, fontWeight: '700' }}>{weather.loading ? 'Loading weather…' : `${weather.emoji} ${weather.temperature || '—'}`}</Text>
          <Text role="title3" textStyle={{ color: colors.heroText }}>{weather.condition}</Text>
          {weather.detail ? <Text role="subheadline" textStyle={{ color: colors.heroText }}>{weather.detail}</Text> : null}
        </Column></NativeContent>
        {today ? <>
          <View style={{ height: 0.5, backgroundColor: colors.heroText, opacity: 0.2 }} />
          <NativeContent><Column spacing={5}>
            <Text role="headline" textStyle={{ color: colors.heroText, fontWeight: '600' }}>Through today</Text>
            <Text role="footnote" textStyle={{ color: colors.heroText }}>{`Remaining forecast ${today.range}${today.detail ? ` · ${today.detail}` : ''}`}</Text>
          </Column></NativeContent>
          <WeatherHours hours={today.hours} hero />
        </> : null}
      </View>
      <NativeContent><Column spacing={4}>
        <Text role="title2" textStyle={{ color: colors.text, fontWeight: '600' }}>The week ahead</Text>
        <Text role="footnote" textStyle={{ color: colors.secondaryText }}>Tap a day for times · Oslo local time</Text>
      </Column></NativeContent>
      <View style={{ backgroundColor: colors.surface, borderRadius: layout.cardRadius, paddingHorizontal: 18 }} testID="weather-days">
        {weather.days.length === 0 ? <View style={{ paddingVertical: 18 }}><NativeContent>
          <Text role="subheadline" textStyle={{ color: colors.secondaryText }}>{weather.loading ? 'Loading the seven-day forecast…' : 'Connect to load the next seven days. The guide is still available offline.'}</Text>
        </NativeContent></View> : null}
        {upcomingDays.map((day, index) => <WeatherDayRow key={day.date} day={day} first={index === 0} />)}
      </View>
      <NativeContent><Column spacing={6}>
        <Text role="footnote" textStyle={{ color: colors.secondaryText }}>{weather.status || 'Forecast from MET Norway. Conditions can change.'}</Text>
        <Button label={weather.loading ? 'Refreshing…' : 'Refresh weather'} disabled={weather.loading} variant="text" testID="weather-refresh" onPress={onRetry} />
        <Button label="Weather data: MET Norway" variant="text" onPress={onSource} />
        <Button label="CC BY 4.0 · Forecast summarised for this app" variant="text" onPress={onLicense} />
        {linkError ? <Text role="footnote" textStyle={{ color: colors.secondaryText }}>{linkError}</Text> : null}
      </Column></NativeContent>
    </View>
  </ScrollView>;
}
