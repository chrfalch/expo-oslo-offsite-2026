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

Android predictive back is disabled for this canary: on the Android 14 emulator, enabling it bypasses React Native's Back handling and backgrounds the app instead of dismissing a location sheet. Keep it disabled until the native compatibility issue is resolved, and verify Back after any SDK upgrade.

Native folders are generated and ignored by Git. After adding/updating native dependencies or changing native configuration, regenerate using the pinned template **and rebuild/reinstall** the development app:

```sh
npm run prebuild -- --platform ios
npm run ios -- --device "iPhone 17 Pro"
# For Android:
npm run prebuild -- --platform android
npm run android -- --device <emulator-or-device-id>
```

The `preios`/`preandroid` hooks only generate missing native folders; they do not refresh existing projects after dependencies change. A JavaScript reload or export cannot add missing native libraries (for example, `ExpoAppMetrics` from Expo Observe, or Expo Updates). Confirm the rebuilt app launches successfully before considering a native dependency update complete. If Metro is already running for this project, reuse it and add `--no-bundler` to the build command.

## Project layout

```text
src/app/                 Routes and per-tab layouts only
  (tabs)/                Overview /, Schedule /schedule, and Oslo /oslo
  onboarding.tsx         First-run attendee selection
  place/, activity/      Guide detail routes
  location/              Shared location route
  profile.tsx, packing.tsx, travel.tsx, bases.tsx, food.tsx, practical.tsx
src/screens/             Data adapters, filter state, and navigation callbacks
src/state/               Per-device preferences store and React provider
src/presentation/        Expo UI views accepting display models and actions
src/components/          Navigation, screen host, and shared cards
src/data/offsite-data.json  Bundled offline source of truth
src/data/offsite.ts       Public typed data API and display helpers
src/data/offsite-guide.ts Pure filtering, lookup and sorting helpers
src/data/offsite-types.ts Shared content types
src/data/offsite-format.ts Calendar dates and missing-value formatting
src/data/attendees.ts     Selectable attendees and stable device-local IDs
src/data/locations.ts     Shared location lookup and external Maps URLs
src/media/guide-images.ts  Static bundled guide image registry
assets/                   Guide photos, logos and app icons available offline
tests/                   Data, location and preference persistence tests
src/theme.ts             Shared light/dark palette
scripts/prepare-native.mjs  First-run canary native template selection
```

On first launch, choose from a plain list of seven attendees. Christian Falch is excluded from that list, while the original travel data still includes him as the organizer. There is no account, password, or attendee search. The profile button lets you change person later.

Overview shows your next arrival or departure and the next shared activity in Oslo time. The whole Coming up card opens the activity details, including when tapping its bundled photo; map access is available on the activity screen. Schedule has a day picker, compact work and activity rows, and team travel; it opens on today during the offsite and All days outside it. Oslo leads to 43 places, saved places, workspace, accommodation, food, packing, and practical information. Place browsing uses a continuous list with native search, category and walking-base filters, and separate bookmarks. On iOS 26, the magnifying glass in the bottom toolbar expands into search above the keyboard. Every venue, workspace, apartment and named travel location opens the shared location screen. Launcher artwork uses the custom Oslo Offsite opera-house and fjord icon in `assets/branding/oslo-offsite-icon.png`. Expo generates the native sizes.

Support is available from the footer at the bottom of Overview, with Christian’s phone number, call and WhatsApp links, and a friendly one-person help desk. Christian’s home at Stensgata 26A, 0358 Oslo is available under Support, Oslo’s Our bases section, and the Home option on the Our bases screen. The location opens an address search in Maps; no unverified coordinates are stored. Contact details and the home address live in `offsiteData.support` and remain available offline. The home and Support screens include a bundled exterior photo by Jan-Tore Egge from Wikimedia Commons, with source and CC BY-SA 4.0 links. Its complete frame is preserved so visitors can see the entrance. Attribution and resize details are also recorded in `assets/places/christian-home.LICENSE.md`.

## Personal preferences

AsyncStorage 2.2 persists the chosen attendee ID and each attendee’s saved place IDs and packing items under `@oslo-offsite/preferences/v1`. Switching attendee preserves separate lists on this device. Writes are serialized so rapid changes cannot replace newer values with an older snapshot. A failed save offers retry; a failed load does not overwrite stored data. Removed guide items are pruned during hydration. Uninstalling the app clears these preferences; there is no cross-device sync.

## Maps

`expo-maps` uses Apple Maps on iOS and Google Maps on Android. No device location permission is requested: the app shows destinations from the guide. The location screen also opens the device’s native Maps app, with a browser fallback. Map tiles and external links may need internet access.

For Android, add a Maps SDK for Android key to the ignored `.env.local` file:

```dotenv
GOOGLE_MAPS_API_KEY=your_android_maps_key
```

Enable Maps SDK for Android for the key and restrict it to `com.chrfalch.oslooffsite2026` and the signing certificate used for your build. Regenerate and rebuild the Android app after adding or changing it:

```sh
npm run prebuild -- --platform android
npm run android
```

Without a key, the Android screen shows the address and an external Maps button instead of mounting Google Maps. This keeps the guide usable and avoids the native missing-key crash. `app.config.ts` reads the key for native configuration; only a boolean availability flag is exposed to the screen.

Apartment cards and location screens display their saved addresses and photo galleries. Confirmed coordinates place the apartment on the map; an address without coordinates opens an address search in Maps. Unknown apartment addresses stay unknown and link to the explicitly approximate Torshov area. Street-level coordinates are labelled approximate. Named airports without coordinates use a Maps search handoff.

Schema 1.4 adds optional `image` metadata to places, schedule events, foods, customer apps and the workspace: `file`, `type` (`photo`, `logo`, `icon`, `artwork`), `sourceUrl`, `sourcePage`, `sourceDomain`, `credit` and `licence`. Foods and apps have stable IDs. Apartment galleries keep `photos: [{ "file": "assets/accommodation/example.jpg", "sourceUrl": "https://…", "caption": "Living room" }]`. All 74 supplied JPG, PNG and WebP files are bundled through literal imports in `src/media/guide-images.ts`. Source URLs are retained for provenance and never used to load images. Supplied credits are displayed beneath images; missing images leave the text available. Photo galleries keep their captions, logos are contained, and app icons use a compact square. `assets.folders`, `imageFormats` and `rightsNote` retain the source's asset metadata.

The 9 September accommodation update includes descriptions, capacities, amenities, check-in/check-out times, hosts, and estimated walks to Rebel. Airbnb coordinates are approximate to roughly 100–200 metres, and both the map and handoff labels make this explicit. Exact street addresses remain unknown until supplied from booking confirmations. The shared Torshov walking reference now uses the centre of the three approximate listing locations.

## Adjusting the design

The [iOS design changes and screenshots](docs/DESIGN-FIXES-IOS.md) document the current hierarchy, Dynamic Type support, completion controls, and native search replay.

The static Playground design uses a neutral background, a solid lilac hero, an amber year badge, and the bundled Expo mark. There is no mesh or gradient dependency. Edit `src/theme.ts` for the shared palette, spacing, radii and content width; edit `src/presentation/*-view.tsx` for layout and typography. `GuideCardModel` contains display-ready strings and links, so card changes do not need to touch the JSON schema or selectors.

Screen controllers in `src/screens/` select and format data, own filter state, and pass actions into the views. Presentation files do not import data, preference state or the router; lint enforces this boundary. `src/components/` contains the shared native host, cards, link controls and navigation. Expo UI renders text and controls through SwiftUI / Compose, while React Native handles responsive page geometry and decorative shapes.

## Offline data API

Import from `@/data/offsite` in a screen or component. The JSON is included in the app bundle, so all guide data is available immediately, including on the first offline launch. All bundled guide images are also available offline. No provider, hook, permission, fetch request or loading state is required. Website, Airbnb and app-store buttons open external destinations that require connectivity. This does not add offline map tiles or offline installation/caching of the web app itself.

Overview has playful icon badges on its main navigation rows. “Expo products to try” is a row alongside Workspace, Apartments and the other guide sections, opening a dedicated product list. The six products include Thon Hotels for colleagues arriving early. Each entire product row opens its store listing; there are no separate store buttons. Each entry in `expoCustomerApps` has an `appStoreUrl` and `googlePlayUrl`, verified against the official listings on 9 September 2026. Android and Android browsers open Google Play; iOS and other browsers open the App Store. The links use HTTPS so the installed store app or browser can handle them. App icons, including Thon Hotels, remain bundled for offline use. Practical info contains FAQ and travel information.

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

Replace `src/data/offsite-data.json` with the updated source JSON, copy the referenced images into their matching `assets/` folders and update the literal imports in `src/media/guide-images.ts`, then run `npm test` and `npm run typecheck`. For example, from the project root:

```sh
cp "/path/to/updated/offsite-data.json" src/data/offsite-data.json
npm test
npm run typecheck
```

The app has no dependency on the original source's location on a developer's computer. A changed snapshot is picked up by the development bundler; installed production apps receive it with the next app bundle. When merging an upstream snapshot, preserve verified local captions for unchanged files and retain `approximate` in `geo.precisionValues` for Airbnb coordinates. The tests check every referenced image’s file signature and offline resolution, relationships, coordinates, date/time values, missing fields, photo metadata, apartment Maps fallbacks, sorting and the corrected overnight arrival. If the schema or confirmed itinerary changes, update the types and affected expectations alongside the JSON.

### Optimize refreshed images

Optimize guide images before shipping a data refresh. The original 74 guide images were reduced from 19.1 MB to about 8.3 MB while preserving filenames, aspect ratios, transparency and source metadata in the JSON. The additional home photo is resized to 1600 pixels on its longest side. Keep the full-resolution originals outside the app repository.

Expo’s documented `npx expo-optimize . --quality 80 --include 'assets/{accommodation,places,food,apps,schedule,workspace}/**/*.{jpg,png}'` command uses `sharp-cli` (available on PATH). Keep its generated `.expo-shared/assets.json` so unchanged JPEGs and PNGs are not recompressed. The published Expo optimizer only handles JPEG/PNG; WebP files need a separate Sharp pass.

For new images, use Sharp to fit photos/artwork within 1600 × 1600 pixels and app icons within 256 × 256, preserving aspect ratio and never enlarging. Use JPEG/WebP quality 80; PNGs can use a quality-90 palette with transparency preserved. Encode from the originals and replace a bundled file only when the result is smaller. Check representative images visually, run the existing image tests, and verify all referenced assets remain in the native exports. Repeat this step whenever new photos are imported.

## Checks

```sh
npm test
npm run typecheck
npm run lint
npx expo install --check
npx expo-doctor
npx expo export --platform all
```

`npm test` compiles the pure data and preferences modules and tests into a temporary directory, runs Node's built-in test runner with no additional test framework, and removes the generated files. Tests use their own TypeScript configuration so Node test types do not enter the app's compilation.

Native walkthroughs are saved in `.argent/flows/`: `offsite-personal-android` verifies packing and identity after restarting the app; `offsite-switch-and-save-android` covers choosing an attendee, browsing, saving, and Google Maps handoff; `offsite-maps-ios` covers the embedded Apple map and Apple Maps handoff. Read each flow’s entry prerequisites. The iOS flow uses AX-gated coordinates for SwiftUI controls that are absent from Argent’s projected UIKit tree, and is scoped to iPhone 17 Pro on iOS 26.5. All three flows passed after authoring.

## Canary compatibility notes

The Maps canary’s precompiled iOS framework imports unavailable Swift Testing modules under Xcode 26.6. `expo.autolinking.ios.buildFromSource: ["expo-maps"]` in `package.json` builds the matching Maps source instead. Both native builds pass with this configuration. Revisit it with the next SDK 58 canary.

`react-native-safe-area-context` is pinned to **5.9.1** because the template's 5.7.0 references the removed Android `UIImplementation` API and does not compile with React Native 0.87. It is explicitly excluded from Expo's older recommended-version check. The [upstream release notes](https://github.com/AppAndFlow/react-native-safe-area-context/releases) document the fix and AGP 9 support. Both native apps were rebuilt with this dependency.

This Expo UI canary accepts numeric native frame widths even though its universal TypeScript style permits percentages. `useContentWidth()` and the measured `NativeContent` host provide numeric widths, preventing an Android native crash and inconsistent iOS card widths. The overview manages its own insets and disables NativeTabs' automatic iOS inset adjustment to avoid double top spacing.

The published canary template still references Reanimated 4.5.1 and Worklets 0.10.1, which do not support React Native 0.87. The demo animation code and those direct dependencies have been removed. Router still brings animation packages transitively; `package.json` overrides Worklets to **0.12.2**, which supports React Native 0.87 and matches the resolved Reanimated 4.6.0. This also prevents duplicate Expo Modules Core installs caused by the canary's older optional peer range. Revisit the override with the next SDK 58 canary.

The first-run helper and `prebuild` script explicitly select the matching native template because the CLI's default `expo-template-bare-minimum@sdk-58` tag is not published yet. Keep the lockfile, and update the Expo canary packages and native template together.

TypeScript selects React Native's bundled legacy declarations via `react-native-legacy-deep-imports`. The canary's generated `expo-env.d.ts` imports web style augmentations that conflict with React Native 0.87's new default type aliases. This condition keeps strict checking working without changing the native runtime or patching packages; revisit it when Expo updates those augmentations.

References: [Expo native tabs](https://docs.expo.dev/router/advanced/native-tabs/), [Expo UI](https://docs.expo.dev/versions/unversioned/sdk/ui/), and [Expo prereleases](https://docs.expo.dev/versions/latest/). For exact canary APIs, the installed package types are the source of truth.

SwiftUI text-measurement modifiers live in `offsite-screen-modifiers.ios.ts`; the default module is empty for Android and web. Importing the SwiftUI modifier package in shared code loads its native module on web and breaks client rendering, even when the modifier is conditionally applied only on iOS.
