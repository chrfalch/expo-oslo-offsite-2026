# Build and release Oslo Offsite

## Project and accounts

- EAS: [@chrfalch/oslo-offsite-2026](https://expo.dev/accounts/chrfalch/projects/oslo-offsite-2026).
- EAS project ID: `ab545092-2fb5-4981-ab35-4da120f516d6`.
- iOS and Android identifier: `com.chrfalch.oslooffsite2026`.
- Apple team: `7X29G4MCL4` (Christian Magnus Falch, Individual).
- App Store Connect: Oslo Offsite, app ID `6810129391`.
- Google Play: personal account Christian Magnus Falch, developer ID `7269884736570843910`, using `christian.falch@mezzin.no`. Registration and Android-device verification are complete. Google is reviewing identity documents; contact-phone verification and app creation are blocked until approval. The user changed from the initially planned Falch AS organization account.
- Initial audience: only offsite attendees. Prepare a private TestFlight beta and Google Play internal testing; attendee selection does not restrict access to the bundled guide.
- Use EAS CLI 23.2.0 or newer. Examples pin the version used to prepare this release.

Signing credentials stay in EAS. Never commit credential files or print their contents. The Android upload key is distinct from the signing key Google Play uses for distributed installs.

## Public support and privacy pages

Support: https://oslo-offsite-2026.expo.app/. Privacy: https://oslo-offsite-2026.expo.app/privacy.html. Both use `christian@expo.dev` as the contact. Latest EAS Hosting deployment `5sr6vh8gms` was published and verified on 2026-09-09, including opening both pages from the iOS preview app.

`npm run store:site` builds only the two public documents and their stylesheet into `dist-store/`. Deploy that directory with EAS Hosting. Do not export the guide as the public support website: it contains attendee information. The generator enforces an output-file allowlist and does not include JavaScript, analytics, or guide data.

## Build profiles

| Profile | Distribution | EAS environment | Update channel |
| --- | --- | --- | --- |
| development | Development client, internal | development | development |
| preview | Release app, internal | preview | preview |
| preview-simulator | iOS simulator release app | preview | preview |
| production | TestFlight / Play app bundle | production | production |

`base` holds inherited settings; build one of the profiles above. `preview-simulator` extends `preview` and targets iOS simulators without device provisioning. The pinned native template matches the SDK 58 canary. Keep the template, Expo packages, lockfile, and compatibility fixes together when upgrading. The `prebuildCommand` override is essential: SDK 58's default template tag is not published yet.

Native directories are generated and excluded from EAS's uploaded source. Preview and development iOS device builds need registered devices; production iOS builds use App Store signing. Adding Updates or Observe requires rebuilding existing development clients.

## Prepare and validate

```sh
npm ci
npm test
npm run typecheck
npm run lint
npx expo install --check
npx expo-doctor
npx expo export --platform all
```

Use the current `RELEASE-CHECKLIST.md` to finish account, Maps, store information, and tester setup. Review the source snapshot before building; concurrent changes after a build starts are not included in that build.

For embedded Google Maps on Android, create `GOOGLE_MAPS_API_KEY` in the EAS environments used for builds and updates. Use sensitive visibility so configuration can resolve it for both operations. Restrict the key to Maps SDK for Android, this package name, and the appropriate certificate fingerprints. Play-installed apps need the **Play app-signing** SHA-1; an EAS-distributed APK needs the **EAS upload key** SHA-1. The key is included in the native Android app, so API restrictions provide its protection. With no key configured, the existing external Maps fallback remains available.

The user selected the external Google Maps button for this beta. Leave the Maps key unset for the release; the embedded-map instructions above apply to a future change.

Verified EAS upload certificate SHA-1: `A0:4B:9D:B0:06:BB:21:48:CE:06:FA:15:25:70:E2:69:3D:06:28:C7`. This is public certificate metadata, not a signing secret. Obtain the separate Play app-signing fingerprint from Play Console before configuring a key for store-installed builds.

## Build before submitting

```sh
npx eas-cli@23.2.0 build --platform all --profile production --no-wait
```

Record both exact build IDs and links in the checklist. Inspect cloud logs and artifacts. Test a release app on a device: first launch, attendee selection, saved places and packing after restart, guide content offline, location screens, and external Maps. Check Update and Observe behavior with a release build. Production exports alone do not validate native compilation or device startup.

Store build numbers are managed remotely and increment automatically. `expo.version` remains the user-facing version and the Updates compatibility boundary.

## Submit the prepared artifacts

The iOS `ascAppId` is saved in `eas.json`, and its App Manager submission key is assigned in EAS. Finish personal Play enrollment, create its app record, enable Play App Signing, and store the Google service-account submission key in EAS. The submit profile targets internal testing with release status completed; finish app-scoped submission credentials before using it. Internal testing is available to new personal accounts; public production access requires a qualifying closed test and Google's approval.

Submit by exact build ID after preparation and verification:

```sh
npx eas-cli@23.2.0 submit --platform ios --profile production --id IOS_BUILD_ID
npx eas-cli@23.2.0 submit --platform android --profile production --id ANDROID_BUILD_ID
```

Replace the uppercase placeholders with the verified IDs. Do not select `--latest` if other builds may be running. An iOS upload goes to App Store Connect for TestFlight processing; public App Store release is a separate action. Google Play track and release status determine Android availability.

## Publish compatible updates

EAS configured `runtimeVersion: { "policy": "appVersion" }`. Both platform and app version must match the installed app. **Bump `expo.version` and create new native builds whenever native packages, permissions, Maps native configuration, or other native behavior changes.** Auto-incrementing build numbers does not change this compatibility boundary.

Validate JavaScript and bundled content updates on preview first:

```sh
npx eas-cli@23.2.0 update --channel preview --environment preview --platform all --message "Describe the guide change"
```

After testing and confirming the production destination:

```sh
npx eas-cli@23.2.0 update --channel production --environment production --platform all --message "Describe the verified guide change"
```

These commands publish immediately; they are not preparation commands. A normal release launch downloads a compatible update in the background and applies it on the next cold launch. Allow up to two cold launches when testing. Native changes require a new build. If an update fails, use `npx eas-cli@23.2.0 update:rollback` and choose the affected channel and a known-good update or embedded bundle. Check the current command help before performing a rollback.

## Observe

The root layout initializes Observe before screens mount. Expo Router navigation metrics filter dynamic `id` and `key` values; the app does not add attendee names, packing choices, or saved places to telemetry. Interactive timing starts after the preference-gated screen mounts. The update channel labels the telemetry environment, and development dispatch keeps Expo's disabled default.

Preview and production builds upload source maps to EAS for JavaScript error symbolication. The installed canary records JavaScript errors and performance metrics and includes native crash-reporting code; validate its delivery and coverage before relying on it. See `docs/PRIVACY-REVIEW.md` when completing Apple privacy and Google Data safety declarations.

After installing and opening a release build, check the project's Observe dashboard or:

```sh
npx eas-cli@23.2.0 observe:versions
npx eas-cli@23.2.0 observe:metrics-summary
npx eas-cli@23.2.0 observe:routes
```

Verify that data ingestion is enabled and that the expected version, platform, and environment appear. A successful export does not prove telemetry delivery.

The preview releases have sent telemetry from both iOS and Android test installations, including events from the applied preview OTA on both platforms. The current Free account can query version/event counts, but detailed metric queries return a subscription-required error. Upgrade decisions remain with the account owner.

The preview channel currently contains the earlier delivery-test snapshot. A new preview binary can download that compatible older snapshot and apply it on a later cold launch. Publish and verify the intended current snapshot on preview before testing a new candidate across restarts, or explicitly isolate its embedded bundle for that test. No production OTA has been published.

## References

- [EAS configuration](https://docs.expo.dev/eas/json/)
- [EAS build images](https://docs.expo.dev/build-reference/infrastructure/)
- [Updates setup](https://docs.expo.dev/eas-update/getting-started/)
- [Runtime versions](https://docs.expo.dev/eas-update/runtime-versions/)
- [Observe setup](https://docs.expo.dev/eas/observe/get-started/)
- [Observe navigation](https://docs.expo.dev/eas/observe/integrations/expo-router/)
- [Apple submission](https://docs.expo.dev/submit/ios/)
- [Google submission](https://docs.expo.dev/submit/android/)
