import { Stack } from 'expo-router/stack';
import type { PlacesNavigationProps } from './places-navigation';

export function PlacesNavigation({ searchRef, ...props }: PlacesNavigationProps) {
  return <>
    <Stack.Screen options={{ title: 'Places', headerTransparent: true }} />
    <Stack.SearchBar ref={searchRef} placeholder="Search Oslo" autoCapitalize="none" obscureBackground={false}
      placement="integratedButton" allowToolbarIntegration hideWhenScrolling={false} hideNavigationBar={false}
      onChangeText={(event) => props.onQueryChange(event.nativeEvent.text)} onFocus={() => props.onSearchingChange(true)}
      onBlur={() => props.onSearchingChange(false)} onCancelButtonPress={() => { props.onQueryChange(''); props.onSearchingChange(false); }} />
    <Stack.Toolbar placement="bottom">
      <Stack.Toolbar.Menu icon="line.3.horizontal.decrease" accessibilityLabel="Filter places" separateBackground>
        <Stack.Toolbar.Menu title="Category">
          {props.categories.map((item) => <Stack.Toolbar.MenuAction key={item.value} isOn={props.category === item.value} onPress={() => props.onCategoryChange(item.value)}>{item.label}</Stack.Toolbar.MenuAction>)}
        </Stack.Toolbar.Menu>
        <Stack.Toolbar.Menu title="Walking from">
          {props.bases.map((item) => <Stack.Toolbar.MenuAction key={item.value} isOn={props.near === item.value} onPress={() => props.onBaseChange(item.value)}>{item.label}</Stack.Toolbar.MenuAction>)}
        </Stack.Toolbar.Menu>
      </Stack.Toolbar.Menu>
      <Stack.Toolbar.Spacer />
      <Stack.Toolbar.SearchBarSlot separateBackground />
    </Stack.Toolbar>
  </>;
}
