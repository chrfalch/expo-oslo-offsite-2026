# Oslo Offsite · September 2026

A small Expo app for our Oslo offsite. Overview, Schedule, and Oslo tabs read a bundled JSON guide, including the event, activities, team travel, places, accommodation, food, packing and customer apps.

## Stack

- Expo SDK **58.0.0-canary-20260902-26df09e**, with matching Expo UI and Expo Router packages pinned to the same release.
- React 19.2.3, React Native 0.87, strict TypeScript, and React Compiler.
- Expo Router `NativeTabs` with SF Symbols, the system Liquid Glass bottom bar on iOS 26+, and minimize-on-scroll. Each tab owns a native navigation stack.
- `@expo/ui` universal components for screen content: SwiftUI on iOS, Jetpack Compose on Android, and a web implementation. Web navigation uses Expo Router's headless tabs.
- Automatic light and dark appearances, with shared colors in `src/theme.ts`.

## Run

Use Node 22.13 or newer and npm.

```sh
npm ci
npm run ios
```

The first iOS run generates the native project from the matching canary template, installs native dependencies, and builds a development client. You need Xcode and an iOS simulator. Use Xcode 26+ and iOS 26+ to see Liquid Glass; use a matching Xcode/runtime for iOS 27.

```sh
npm run ios -- --device "iPhone 17 Pro"
npm run android
npm run web
```

Android requires Android Studio and an emulator or device. For subsequent JavaScript edits, start the development server with `npm start`. This canary scaffold includes `expo-dev-client`; use its development build for the matching native runtime.

Native folders are generated and ignored by Git. After changing native configuration, regenerate using the pinned template:

```sh
npm run prebuild -- --platform ios
```

## Project layout

```text
src/app/                 Routes and per-tab layouts only
  (overview)/            Overview at /
  schedule/              Schedule at /schedule
  oslo/                  Practical details at /oslo
src/screens/             Data adapters, filter state, and navigation callbacks
src/presentation/        Expo UI views accepting display models and actions
src/components/          Navigation, screen host, and shared cards
src/data/offsite-data.json  Bundled offline source of truth
src/data/offsite.ts       Public typed data API and display helpers
src/data/offsite-guide.ts Pure filtering, lookup and sorting helpers
src/data/offsite-types.ts Shared content types
src/data/offsite-format.ts Calendar dates and missing-value formatting
tests/                   Data integrity and selector tests
src/theme.ts             Shared light/dark palette
scripts/prepare-native.mjs  First-run canary native template selection
```

The overview buttons navigate to the corresponding tabs. The Oslo guide has searchable places, category and walking-base filters, and eight results per page. A guide picker exposes accommodation, logistics, FAQ, food, packing and customer apps. Schedule shows shared activities and separate arrival/departure lists. Launcher icons are the original Expo template placeholders.

## Adjusting the design

The static Playground design uses a neutral background, a solid lilac hero, an amber year badge, and the bundled Expo mark. There is no mesh or gradient dependency. Edit `src/theme.ts` for the shared palette, spacing, radii and content width; edit `src/presentation/*-view.tsx` for layout and typography. `GuideCardModel` contains display-ready strings and links, so card changes do not need to touch the JSON schema or selectors.

Screen controllers in `src/screens/` select and format data, own filter state, and pass actions into the views. Presentation files do not import the data layer or router; lint enforces this boundary. `src/components/` contains the shared native host, cards, link controls and navigation. Expo UI renders text and controls through SwiftUI / Compose, while React Native handles responsive page geometry, decorative shapes and the composite home-card touch targets.

## Offline data API

Import from `@/data/offsite` in a screen or component. The JSON is included in the app bundle, so all guide data is available immediately, including on the first offline launch. No provider, hook, permission, fetch request or loading state is required. Website, Airbnb and App Store buttons open external destinations that require connectivity. This does not add offline map tiles or offline installation/caching of the web app itself.

```ts
import { offsiteData, getPlaces, getPlace, getSchedule, getTravel, getFoodPlaces } from '@/data/offsite';

offsiteData.workspace;           // Every original section is available here
offsiteData.packing;
const coffee = getPlaces({ category: 'coffee', near: 'rebel', maxWalkMinutes: 15 });
const matches = getPlaces({ query: 'grunerlokka pizza', near: 'torshov' });
const venue = getPlace('fuglen'); // undefined for an unknown ID
const tuesday = getSchedule('2026-09-15');
const arrivals = getTravel('arrival'); // { name, role, details }, unknown travel last
const departures = getTravel('departure', '2026-09-19');
const foodVenues = getFoodPlaces(offsiteData.foodToTry.outAndAbout[0]);
```

`getScheduleDays()` groups the sorted social agenda by date. Working days stay in `offsiteData.event.workingDays`; no individual work sessions are invented. `getPlaces()` defaults to alphabetical ordering, or estimated walking time when `near` is supplied. Search ignores case and accents, matches Norwegian ø/æ with o/ae, and searches names, cuisine, addresses, neighbourhoods, descriptions and dishes. Every search term must match. Unknown walking times sort last and are excluded by a maximum-time filter; a zero-minute walk remains valid.

The source is deeply frozen and exposed as readonly TypeScript data. Helpers return new result arrays. `null` continues to mean unknown; `formatBookingStatus`, `formatWalkTime`, `formatEventTime` and `formatTravelLeg` provide explicit display text. `formatOffsiteDate` formats calendar dates without shifting them to the phone's time zone. Times in the source remain Oslo local times, with Hirbod's inbound departure recorded separately from his landing.

Coordinates include source and precision. Walking estimates use straight-line distance with a detour allowance, and Torshov is an approximate neighbourhood reference, not an apartment entrance. Prices and opening hours remain editorial text rather than structured live data.

## Refresh the guide

Replace `src/data/offsite-data.json` with the updated source JSON, then run `npm test` and `npm run typecheck`. For example, from the project root:

```sh
cp "/path/to/updated/offsite-data.json" src/data/offsite-data.json
npm test
npm run typecheck
```

The app has no dependency on the original source's location on a developer's computer. A changed snapshot is picked up by the development bundler; installed production apps receive it with the next app bundle. The tests check relationships, coordinates, date/time values, missing fields, sorting and the corrected overnight arrival. If the schema or confirmed itinerary changes, update the types and affected expectations alongside the JSON.

## Checks

```sh
npm test
npm run typecheck
npm run lint
npx expo install --check
npx expo-doctor
npx expo export --platform all
```

`npm test` compiles the pure data modules and tests into a temporary directory, runs Node's built-in test runner with no additional test framework, and removes the generated files. Tests use their own TypeScript configuration so Node test types do not enter the app's compilation.

## Canary compatibility notes

`react-native-safe-area-context` is pinned to **5.9.1** because the template's 5.7.0 references the removed Android `UIImplementation` API and does not compile with React Native 0.87. It is explicitly excluded from Expo's older recommended-version check. The [upstream release notes](https://github.com/AppAndFlow/react-native-safe-area-context/releases) document the fix and AGP 9 support. Both native apps were rebuilt with this dependency.

This Expo UI canary accepts numeric native frame widths even though its universal TypeScript style permits percentages. `useContentWidth()` and the measured `NativeContent` host provide numeric widths, preventing an Android native crash and inconsistent iOS card widths. The overview manages its own insets and disables NativeTabs' automatic iOS inset adjustment to avoid double top spacing.

The published canary template still references Reanimated 4.5.1 and Worklets 0.10.1, which do not support React Native 0.87. The demo animation code and those direct dependencies have been removed. Router still brings animation packages transitively; `package.json` overrides Worklets to **0.12.2**, which supports React Native 0.87 and matches the resolved Reanimated 4.6.0. This also prevents duplicate Expo Modules Core installs caused by the canary's older optional peer range. Revisit the override with the next SDK 58 canary.

The first-run helper and `prebuild` script explicitly select the matching native template because the CLI's default `expo-template-bare-minimum@sdk-58` tag is not published yet. Keep the lockfile, and update the Expo canary packages and native template together.

TypeScript selects React Native's bundled legacy declarations via `react-native-legacy-deep-imports`. The canary's generated `expo-env.d.ts` imports web style augmentations that conflict with React Native 0.87's new default type aliases. This condition keeps strict checking working without changing the native runtime or patching packages; revisit it when Expo updates those augmentations.

References: [Expo native tabs](https://docs.expo.dev/router/advanced/native-tabs/), [Expo UI](https://docs.expo.dev/versions/unversioned/sdk/ui/), and [Expo prereleases](https://docs.expo.dev/versions/latest/). For exact canary APIs, the installed package types are the source of truth.

SwiftUI text-measurement modifiers live in `offsite-screen-modifiers.ios.ts`; the default module is empty for Android and web. Importing the SwiftUI modifier package in shared code loads its native module on web and breaks client rendering, even when the modifier is conditionally applied only on iOS.
