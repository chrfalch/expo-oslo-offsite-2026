import { Stack } from 'expo-router/stack';
import type { RefObject } from 'react';
import { Platform } from 'react-native';
import type { SearchBarCommands } from 'react-native-screens';

export type PlacesNavigationProps = {
  searchRef: RefObject<SearchBarCommands | null>;
  onQueryChange: (value: string) => void;
  onSearchingChange: (value: boolean) => void;
  category: string;
  categories: readonly { value: string; label: string }[];
  onCategoryChange: (value: string) => void;
  near: string;
  bases: readonly { value: string; label: string }[];
  onBaseChange: (value: string) => void;
};

export function PlacesNavigation({ searchRef, ...props }: PlacesNavigationProps) {
  return <>
    <Stack.Screen options={{ title: 'Places' }} />
    {Platform.OS !== 'web' ? <Stack.SearchBar ref={searchRef} placeholder="Search Oslo" autoCapitalize="none" obscureBackground={false}
      onChangeText={(event) => props.onQueryChange(event.nativeEvent.text)} onFocus={() => props.onSearchingChange(true)}
      onBlur={() => props.onSearchingChange(false)} onCancelButtonPress={() => { props.onQueryChange(''); props.onSearchingChange(false); }} /> : null}
  </>;
}
