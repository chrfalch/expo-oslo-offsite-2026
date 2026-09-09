import { Button as NativeButton, Column, RNHostView, Row } from '@expo/ui';
import { useEffect, useRef } from 'react';
import { FlatList, Image, Platform, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/button';
import { ChoiceControl } from '@/components/choice-control';
import { rowContentModifiers, rowModifiers } from '@/components/control-modifiers';
import { SystemSymbol } from '@/components/symbol';
import { Text } from '@/components/text';
import type { GuideImageModel } from '@/presentation/guide-image';
import { NativeContent } from '@/presentation/native-content';
import { useContentWidth, useOffsiteTheme } from '@/theme';

export type PlaceRowModel = {
  id: string; title: string; subtitle: string; walk: string; image?: GuideImageModel;
  saved: boolean; onPress: () => void; onSave: () => void;
};
export type PlacesViewProps = {
  savedOnly: boolean; savedCount: number; onSavedOnlyChange: (value: boolean) => void;
  category: string; categories: readonly { value: string; label: string }[]; onCategoryChange: (value: string) => void;
  near: string; bases: readonly { value: string; label: string }[]; onBaseChange: (value: string) => void;
  query: string; onQueryChange: (value: string) => void; searching: boolean; headerHeight: number;
  filterSummary: string; places: readonly PlaceRowModel[];
  emptyTitle: string; emptyDescription: string; resetLabel: string; onReset: () => void;
};

export function PlacesView(props: PlacesViewProps) {
  const { colors } = useOffsiteTheme();
  const width = useContentWidth();
  const insets = useSafeAreaInsets();
  const list = useRef<FlatList<PlaceRowModel>>(null);
  useEffect(() => { list.current?.scrollToOffset({ offset: 0, animated: false }); }, [props.query, props.category, props.near, props.savedOnly]);
  return <FlatList ref={list} data={props.places} keyExtractor={(item) => item.id}
    style={{ flex: 1, backgroundColor: colors.background }} contentInsetAdjustmentBehavior="never" automaticallyAdjustContentInsets={false}
    automaticallyAdjustKeyboardInsets keyboardDismissMode="interactive" keyboardShouldPersistTaps="handled" initialNumToRender={8}
    contentContainerStyle={{ width: width + 40, alignSelf: 'center', paddingHorizontal: 20, paddingTop: (Platform.OS === 'ios' ? props.headerHeight : 0) + 12, paddingBottom: insets.bottom + 90 }}
    ListHeaderComponent={<View style={{ paddingBottom: 12 }}><NativeContent><Column spacing={12} style={{ width }}>
      <ChoiceControl id="places-mode" label="Places" width={width} value={props.savedOnly ? 'saved' : 'all'}
        options={[{ value: 'all', label: 'All places' }, { value: 'saved', label: `Saved · ${props.savedCount}` }]}
        onChange={(value) => props.onSavedOnlyChange(value === 'saved')} />
      {Platform.OS === 'web' ? <RNHostView matchContents><TextInput value={props.query} onChangeText={props.onQueryChange} placeholder="Search Oslo"
        autoCapitalize="none" testID="place-search" accessibilityLabel="Search Oslo" style={{ width, minHeight: 44, fontSize: 17, color: colors.text }} /></RNHostView> : null}
      {Platform.OS !== 'ios' && !props.searching ? <>
        <ChoiceControl id="place-category" label="Category" width={width} value={props.category} options={props.categories} onChange={props.onCategoryChange} />
        <ChoiceControl id="place-base" label="Walking from" width={width} value={props.near} options={props.bases} onChange={props.onBaseChange} />
      </> : null}
      <Text role="subheadline" textStyle={{ color: colors.secondaryText }}>{`${props.places.length} ${props.places.length === 1 ? 'place' : 'places'} · ${props.filterSummary}`}</Text>
    </Column></NativeContent></View>}
    renderItem={({ item }) => <PlaceRow place={item} width={width} />}
    ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.border }} />}
    ListEmptyComponent={<NativeContent><Column spacing={14} style={{ width, paddingVertical: 24 }}>
      <Text role="title2" textStyle={{ fontWeight: '700', color: colors.text }}>{props.emptyTitle}</Text>
      <Text textStyle={{ color: colors.secondaryText }}>{props.emptyDescription}</Text>
      <Button label={props.resetLabel} onPress={props.onReset} testID="places-reset" />
    </Column></NativeContent>} />;
}

function PlaceRow({ place, width }: { place: PlaceRowModel; width: number }) {
  const { colors } = useOffsiteTheme();
  const { fontScale } = useWindowDimensions();
  const showImage = place.image && fontScale <= 1.3;
  const mainWidth = width - 52;
  return <View style={{ width, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
    <View style={{ width: mainWidth }}><NativeContent>
      <NativeButton variant="text" testID={`place-${place.id}`} onPress={place.onPress}
        modifiers={rowModifiers(`${place.title}, ${place.subtitle}, ${place.walk}`, undefined, `place-${place.id}`)}>
        <Row spacing={12} style={{ width: mainWidth, paddingVertical: 12 }} modifiers={rowContentModifiers(mainWidth)}>
          {showImage ? <RNHostView matchContents><Image source={place.image!.source} accessible={false} style={{ width: 64, height: 64, borderRadius: 12 }} /></RNHostView> : null}
          <Column spacing={4} style={{ width: mainWidth - (showImage ? 76 : 0) }}>
            <Text textStyle={{ fontWeight: '600', color: colors.text }}>{place.title}</Text>
            <Text role="subheadline" textStyle={{ color: colors.secondaryText }}>{place.subtitle}</Text>
            <Text role="subheadline" textStyle={{ color: colors.secondaryText }}>{place.walk}</Text>
          </Column>
        </Row>
      </NativeButton>
    </NativeContent></View>
    <View style={{ width: 44 }}><NativeContent>
      <Button variant="text" onPress={place.onSave} selected={place.saved} testID={`save-${place.id}`}
        accessibilityLabel={`${place.saved ? 'Remove' : 'Save'} ${place.title}${place.saved ? ' from saved places' : ''}`}>
        <Row alignment="center" style={{ width: 44, height: 44 }} modifiers={rowContentModifiers(44)}><SystemSymbol name={place.saved ? 'bookmark.fill' : 'bookmark'} color={colors.accent} /></Row>
      </Button>
    </NativeContent></View>
  </View>;
}
