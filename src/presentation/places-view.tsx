import { Button, Column, Picker, Row, Text, TextInput } from '@expo/ui';

import { InfoCard } from '@/components/info-card';
import { useScrollToTop } from '@/components/offsite-screen';
import { GuideCard, type GuideCardModel } from '@/presentation/guide-card';
import { useContentWidth, useOffsiteTheme } from '@/theme';

export type PlacesViewProps = {
  savedOnly: boolean;
  savedCount: number;
  onSavedOnlyChange: (value: boolean) => void;
  category: string;
  categories: readonly { value: string; label: string }[];
  onCategoryChange: (value: string) => void;
  near: string;
  bases: readonly { value: string; label: string }[];
  onBaseChange: (value: string) => void;
  onQueryChange: (value: string) => void;
  walkingNote: string;
  resultSummary: string;
  places: readonly GuideCardModel[];
  page: number;
  pageCount: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
};

export function PlacesView(props: PlacesViewProps) {
  const { colors } = useOffsiteTheme();
  const contentWidth = useContentWidth();
  const scrollToTop = useScrollToTop();
  return (
    <>
      <Picker selectedValue={props.savedOnly ? 'saved' : 'all'} onValueChange={(value) => props.onSavedOnlyChange(value === 'saved')} testID="places-mode">
        <Picker.Item label="All places" value="all" />
        <Picker.Item label={`Saved · ${props.savedCount}`} value="saved" />
      </Picker>
      <InfoCard title="Find your Oslo" description="Food, coffee and things to do, closest first.">
        <TextInput
          placeholder="Search places, food or neighbourhoods"
          testID="place-search"
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={props.onQueryChange}
          style={{ width: contentWidth - 44, padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 12 }}
          textStyle={{ color: colors.text, fontSize: 16 }}
        />
        <Text textStyle={{ color: colors.secondaryText }}>Category</Text>
        <Picker selectedValue={props.category} onValueChange={props.onCategoryChange} testID="place-category">
          {props.categories.map((option) => <Picker.Item key={option.value} {...option} />)}
        </Picker>
        <Text textStyle={{ color: colors.secondaryText }}>Walking from</Text>
        <Picker selectedValue={props.near} onValueChange={props.onBaseChange} testID="place-base">
          {props.bases.map((option) => <Picker.Item key={option.value} {...option} />)}
        </Picker>
        <Text textStyle={{ fontSize: 14, lineHeight: 21, color: colors.secondaryText }}>{props.walkingNote}</Text>
      </InfoCard>
      <Text textStyle={{ color: colors.secondaryText }}>{props.resultSummary}</Text>
      <Column spacing={16} style={{ width: contentWidth }}>
        {props.places.map((card) => <GuideCard key={card.id} card={card} />)}
      </Column>
      {!props.places.length ? <InfoCard title={props.savedOnly ? 'No saved places match' : 'No places found'} description={props.savedOnly ? 'Save a place from its details, or adjust your filters.' : 'Try a different search or choose All categories.'} /> : null}
      {props.pageCount > 1 ? (
        <Row spacing={12}>
          <Button label="Previous" variant="outlined" disabled={props.page === 1} onPress={() => { props.onPreviousPage(); scrollToTop(); }} />
          <Button label="Next places" disabled={props.page === props.pageCount} onPress={() => { props.onNextPage(); scrollToTop(); }} />
        </Row>
      ) : null}
    </>
  );
}
