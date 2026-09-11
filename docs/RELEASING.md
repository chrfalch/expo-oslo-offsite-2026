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

Embedded Android Maps was configured and verified locally on 2026-09-09. Google Cloud project `chrfalch-oslo-offsite-2026` has Maps SDK for Android enabled and the new “My Billing Account” linked under `christian.falch@mezzin.no`. The “Oslo Offsite Android Maps” key is restricted to that SDK, this package name, and the local debug/EAS upload certificates. `GOOGLE_MAPS_API_KEY` is saved in ignored `.env.local` and all three EAS environments with sensitive visibility. A rebuilt Android development app rendered street tiles and the Fuglen destination pin on the emulator.

The earlier Android beta binaries do not contain this native key; Android 1.0.0 (9) is the verified replacement containing it. Users need the new Android binary because an OTA update alone cannot add the native key. Add the Play app-signing SHA-1 to the key restrictions before testing a Play-installed release.

Allowed certificate SHA-1 fingerprints (public certificate metadata):

- Local debug: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`.
- EAS upload: `A0:4B:9D:B0:06:BB:21:48:CE:06:FA:15:25:70:E2:69:3D:06:28:C7`.

Obtain the separate Play app-signing fingerprint from Play Console before configuring a key for store-installed builds.

## Build before submitting

```sh
npx eas-cli@23.2.0 build --platform all --profile production --no-wait
```

Record both exact build IDs and links in the checklist. Inspect cloud logs and artifacts. Test a release app on a device: first launch, attendee selection, saved places and packing after restart, guide content offline, location screens, and external Maps. Check Update and Observe behavior with a release build. Production exports alone do not validate native compilation or device startup.

Store build numbers are managed remotely and increment automatically. `expo.version` remains the user-facing version and the Updates compatibility boundary.

## Current uploaded release

On 2026-09-10, iOS 1.0.0 (7), including arrival and departure dates/times beneath each attendee, was uploaded through EAS Submit and processed successfully by Apple (`VALID`). [EAS build `9ad088eb-10e6-45be-9f61-9c44dee6f5c1`](https://expo.dev/accounts/chrfalch/projects/oslo-offsite-2026/builds/9ad088eb-10e6-45be-9f61-9c44dee6f5c1) finished at 07:55:58 UTC; [submission `a7edd19b-693a-4961-b998-ce5ceb6e2bbb`](https://expo.dev/accounts/chrfalch/projects/oslo-offsite-2026/submissions/a7edd19b-693a-4961-b998-ce5ceb6e2bbb) completed at 08:01:44 UTC. Strict artifact signing and embedded travel text were verified. The upload includes the two uncommitted attendee-screen changes on top of `8a0ffd4`; see the checklist for the full source digest. [App Store Connect](https://appstoreconnect.apple.com/apps/6810129391/testflight/ios) reports internal state `IN_BETA_TESTING` and external state `READY_FOR_BETA_SUBMISSION`. No external beta review submission, new tester groups, invitations, or public release was performed for build 7.

The previous iOS 1.0.0 (4) remains in the private `Offsite attendees` group waiting for external beta review. EAS build: `ce7ace99-7e9d-486c-b676-03b3f72b8def`; submission: `5b251776-4099-4974-9024-b37af52befcd`. Automatic tester notifications and public links were disabled for that group.

Android 1.0.0 (9), [EAS build `13c49daf-65d5-4e9f-8902-ba390b0a471d`](https://expo.dev/accounts/chrfalch/projects/oslo-offsite-2026/builds/13c49daf-65d5-4e9f-8902-ba390b0a471d), finished at 16:58 UTC on 2026-09-09 from commit `d8dfd823a65ac943b4d7e66ccf314e890c6138a6`. The signed AAB is verified: Maps key, package/version, production update channel/project, runtime `1.0.0-android-maps-v1`, and EAS upload certificate all match. This replaces the earlier Android candidates for embedded Maps. It has not been submitted to Google Play. Google identity approval still blocks contact-phone verification and creation of the Play listing; add the Play app-signing SHA-1 to the Maps key and verify a Play-installed build once available.

## Direct Android installation

For direct installation by Android attendees, share the [tested preview installation page](https://expo.dev/accounts/chrfalch/projects/oslo-offsite-2026/builds/a0586211-0b10-4768-b52d-0ea95503c153) or [download the APK](https://expo.dev/artifacts/eas/tWHMr9IzDxHpG4UGM8Z4k-J4OBtX46gFwZQLKfEG_sE.apk). This is Android 1.0.0 (9), built with the `preview` profile on 2026-09-10. It supports Android 7.0 and newer. Download and open the APK on the phone, allowing installation from the browser if Android prompts. Anonymous download, updating the previous preview while preserving attendee selection, and embedded Maps rendering are verified. No Expo account or Play test enrollment is required; anyone with the link can download the guide, so share it within the attendee group. This preview uses the `preview` update channel. The production AAB described above remains the separate Google Play candidate.

## Submit the prepared artifacts

The iOS `ascAppId` is saved in `eas.json`, and its App Manager submission key is assigned in EAS. The Google service-account key is also assigned in EAS and verified with Google. Its public certificate expires on 2027-09-09; rotate it before expiry. Google Cloud project `chrfalch-oslo-offsite-2026` has Android Publisher API enabled. Finish Play identity/phone verification, create the app record, enable Play App Signing, and grant the service account app-scoped testing permissions. The submit profile targets internal testing with release status completed; finish app-scoped submission credentials before using it. Internal testing is available to new personal accounts; public production access requires a qualifying closed test and Google's approval.

Submit by exact build ID after preparation and verification:

```sh
npx eas-cli@23.2.0 submit --platform ios --profile production --id IOS_BUILD_ID
npx eas-cli@23.2.0 submit --platform android --profile production --id ANDROID_BUILD_ID
```

Replace the uppercase placeholders with the verified IDs. Do not select `--latest` if other builds may be running. An iOS upload goes to App Store Connect for TestFlight processing; public App Store release is a separate action. Google Play track and release status determine Android availability.

## Publish compatible updates

The phone-number copy update was published on 2026-09-10 with full availability on both production and preview. Production serves TestFlight/production builds; preview serves the directly shared Android APK. iOS runtime `1.0.0` and both Android runtimes (`1.0.0-android-maps-v1` and legacy `1.0.0`) are covered. See the [release checklist](../RELEASE-CHECKLIST.md#phone-number-copy-update--2026-09-10) for exact update groups and validation. The production and preview bundles are identical.

EAS configured `runtimeVersion: { "policy": "appVersion" }`. Android builds with a Maps key override this with `<app version>-android-maps-v1`, isolating them from older binaries without a key; iOS retains the app-version policy. Builds and updates must use an EAS environment with the same Maps configuration. **Bump `expo.version` and create new native builds whenever native packages, permissions, or other native behavior changes.** Adding the first Android Maps key already changes the Android runtime; later key changes require a version bump and rebuild. Auto-incrementing build numbers does not change this compatibility boundary.

When also updating older Android installers, prepare a separate source/config snapshot with no native Maps key and `extra.androidMapsConfigured: false`, retaining the original `1.0.0` runtime. Publish the tested Android bundle with that snapshot to both channels. Never assign the Maps-enabled configuration to the older runtime. The copy release used this approach and verified both legacy preview build 4 and Maps-enabled preview build 9.

Validate JavaScript and bundled content updates on preview first:

```sh
npx eas-cli@23.2.0 update --channel preview --environment preview --platform all --message "Describe the guide change"
```

After testing and confirming the production destination:

```sh
npx eas-cli@23.2.0 update --channel production --environment production --platform all --message "Describe the verified guide change"
```

These commands publish immediately; they are not preparation commands. The app checks for updates at startup without blocking the guide. Once a compatible update is downloaded, a native alert offers **Restart now** or **Later**, at most once per app session. Choosing Later leaves the update ready for a subsequent cold launch; failed checks stay silent. The prompt runs only in native release builds with Updates enabled, and waits until the app is active. Existing installations must first receive this behavior through the previous update flow, which can take two cold launches. Native changes require a new build. If an update fails, use `npx eas-cli@23.2.0 update:rollback` and choose the affected channel and a known-good update or embedded bundle. Check the current command help before performing a rollback.

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

The initial preview UI validation snapshot was published on 2026-09-09 as group `ee29ca85-8fc9-43ed-b2f7-1cf09907ad07`. Its application was verified on both platforms by visible UI and Observe events. The phone-number copy release described above supersedes it and is also published to production. Always replace or isolate an older compatible preview update before testing a new embedded candidate across restarts.

## References

- [EAS configuration](https://docs.expo.dev/eas/json/)
- [EAS build images](https://docs.expo.dev/build-reference/infrastructure/)
- [Updates setup](https://docs.expo.dev/eas-update/getting-started/)
- [Runtime versions](https://docs.expo.dev/eas-update/runtime-versions/)
- [Observe setup](https://docs.expo.dev/eas/observe/get-started/)
- [Observe navigation](https://docs.expo.dev/eas/observe/integrations/expo-router/)
- [Apple submission](https://docs.expo.dev/submit/ios/)
- [Google submission](https://docs.expo.dev/submit/android/)
