# Oslo Offsite 2026 release checklist

Prepare and validate everything before uploading. Use EAS Build, EAS-managed signing credentials, EAS Update, EAS Observe, and EAS Submit. Audience confirmed: only offsite attendees. Destinations: a private TestFlight beta and Google Play internal testing. Ask setup questions one at a time.

## Embedded Android Maps — 2026-09-09

- [x] Enable Maps SDK for Android in `chrfalch-oslo-offsite-2026`, with the user's approval of the activation terms.
- [x] Link the new “My Billing Account” under `christian.falch@mezzin.no`; the user completed billing setup.
- [x] Create “Oslo Offsite Android Maps”, restricted to Maps SDK for Android, `com.chrfalch.oslooffsite2026`, and the local debug/EAS upload certificates listed in `docs/RELEASING.md`.
- [x] Save `GOOGLE_MAPS_API_KEY` in ignored `.env.local` and the EAS development, preview, and production environments with sensitive visibility.
- [x] Isolate Maps-enabled Android updates with runtime `1.0.0-android-maps-v1`; preserve the iOS runtime.
- [x] Rebuild and install the Android development app, then verify rendered street tiles and the Fuglen destination pin on the emulator. All 56 tests, TypeScript, lint, and native configuration checks pass.
- [x] Build and verify a fresh Android release: Android 1.0.0 (9), [EAS build `13c49daf-65d5-4e9f-8902-ba390b0a471d`](https://expo.dev/accounts/chrfalch/projects/oslo-offsite-2026/builds/13c49daf-65d5-4e9f-8902-ba390b0a471d), finished at 16:58 UTC from pushed source commit `d8dfd823a65ac943b4d7e66ccf314e890c6138a6`. The signed AAB contains the configured Maps key, runtime `1.0.0-android-maps-v1`, correct package, production update channel/project, and no device-location permissions. Its signature matches the allowed EAS upload certificate. Local Android export and cloud native compilation passed. No store submission was requested or performed.
- [ ] Add the Play app-signing SHA-1 to this key once Play App Signing is available, then verify Maps in a Play-installed build.

## Support update builds — 2026-09-09

- Source commit: `ca4528925fdfe1e37b18b9a99ce52d955b7f2f16`, pushed to `master`. Adds the Support screen, playful Overview footer, phone/WhatsApp links, and Christian’s home with a bundled, attributed building photo.
- Validation before upload: TypeScript, lint, all 53 tests, and Android/iOS/web production exports passed. The updated screens were also checked in the iOS simulator.
- Android 1.0.0 (6): [EAS build `b8c44ae8-075c-4842-8665-15d26b9cc633`](https://expo.dev/accounts/chrfalch/projects/oslo-offsite-2026/builds/b8c44ae8-075c-4842-8665-15d26b9cc633), accepted at 13:49 UTC with the `production` profile.
- iOS 1.0.0 (5): [EAS build `efb2c6f4-fe04-4e0d-af77-ea3c574233ff`](https://expo.dev/accounts/chrfalch/projects/oslo-offsite-2026/builds/efb2c6f4-fe04-4e0d-af77-ea3c574233ff), accepted at 13:50 UTC with the `production` profile.
- Both build records identify the source commit above. This request starts builds only; automatic store submission is disabled. Check completion and verify the resulting artifacts before selecting either for a later submission.

## Previous submitted release status — 2026-09-09

- Final source/config/assets snapshot: `fc9e527f7ac811d2ee4f926648e376cf10f5fd6110d9000bd7dd4d886bb44cfa` (175 files), unchanged across both final store uploads. Includes the concurrent design changes and current accommodation data. TypeScript, lint, and all 53 tests pass.
- iOS 1.0.0 (4): `ce7ace99-7e9d-486c-b676-03b3f72b8def`, finished at 10:36 UTC. Strict signed-artifact verification passes; correct bundle ID, production Updates channel, runtime 1.0.0 and EAS project. EAS Submit job `5b251776-4099-4974-9024-b37af52befcd` finished successfully. Apple received build 4 at 10:50 UTC and reports processing state `VALID` (App Store Connect build `da36f042-917e-4ea1-8af0-353995759957`). Beta notes are saved, the build is assigned to the private `Offsite attendees` group, automatic tester notifications are disabled, and external beta review is `WAITING_FOR_REVIEW`. No invitations have been sent.
- Android 1.0.0 (5): `c6bdba9c-9e34-4ef0-97e2-3c993f2e6d6a`, finished at 10:45 UTC. AAB signature, EAS upload certificate, package/version code, production update channel and project URL all match. All 48 inspected 64-bit native libraries pass 16 KB ELF alignment. Google Play app creation remains blocked by Google's pending identity-document review.
- User explicitly authorized sending the bundled attendee names, travel and accommodation details to Expo for builds/preview updates and to both stores for the attendee-only beta.
- Current preview update group `ee29ca85-8fc9-43ed-b2f7-1cf09907ad07` published at 10:23 UTC. iOS `01a085b1-84fd-79a8-9e03-769a01f0742e`; Android `01a085b1-84fd-76c2-a1bb-5e8b5f609a7d`. Observe confirms 42 iOS and nine Android events from this update. No production OTA has been published.
- Current UI checked on local iOS 26.5 and Android 15 release previews. Both destination sheets and external map handoffs open Sukkerbiten correctly. Android also passed clean onboarding with no active network, bundled content/photo loading, and attendee/packing persistence after restart while offline.
- The Apple review contact is saved and verified; no attendee invitations have been sent. Both temporary local QA devices and their Argent services have been stopped.

## 1. Audit and ownership

- [x] Inspect app configuration, dependencies, native generation, and Git state.
- [x] Check local EAS authentication: not logged in at the initial audit.
- [x] Download EAS CLI 23.2.0 into a temporary cache for this setup.
- [x] Run baseline checks: 37 tests, TypeScript, and lint pass before release changes.
- [x] Confirm the Expo account or organization that should own the app: personal account `chrfalch`.
- [x] Sign in and verify access to the selected owner: `chrfalch`, Owner role.
- [x] Create and link `@chrfalch/oslo-offsite-2026`, project ID `ab545092-2fb5-4981-ab35-4da120f516d6`.
- [x] Resolve SDK documentation access: user approved Expo's unversioned canary documentation plus verification against installed packages because the SDK 58 URL returns HTTP 404.

## 2. EAS Build

- [x] Generate EAS configuration with CLI 23.2.0.
- [x] Configure development, preview, and store build profiles with explicit environments; validate all six original platform/profile configurations. Add an iOS `preview-simulator` profile for release QA.
- [x] Configure the matching SDK 58 canary prebuild template and preserve existing compatibility fixes for cloud builds. Both platforms compile successfully.
- [x] Configure remote iOS build numbers and Android version codes with automatic increments on production builds.
- [x] Verify Expo account plan (Free) and select documented Android / Xcode 26.6 images. Both store builds and both preview builds finished successfully.

## 3. Accounts and credentials

- [x] Retain the existing app name and identifiers: Oslo Offsite / com.chrfalch.oslooffsite2026. Both store identities and EAS signing match.
- [x] Authenticate Apple account and confirm team `7X29G4MCL4` (Christian Magnus Falch, Individual), taken from CalTracker as directed. App Store Connect provider: Christian Falch (`532980`).
- [x] Prepare App Store Connect record: Oslo Offsite, app ID `6810129391`, matching bundle identifier.
- [x] Generate a fresh iOS distribution certificate and active provisioning profile through EAS, valid until 2027-09-09. Existing certificate was left untouched; it expires 2026-09-12.
- [x] Create and assign an App Store Connect API key in EAS with APP_MANAGER role for submissions.
- [x] Create and sign in to the Google account `christian.falch@mezzin.no`; the previous personal Play account was closed for inactivity.
- [x] Create a personal Google Play developer account with the selected Google account: developer ID `7269884736570843910`, developer name Christian Magnus Falch. User completed registration/payment. Identity verification is in progress on the user's mobile device. Falch AS organization enrollment was dropped; a D-U-N-S number is not needed.
- [x] Complete Google Android-device verification, confirmed by the user and Play Console on 2026-09-09.
- [ ] Wait for Google identity-document approval, then verify the contact phone number. Play Console currently disables app creation until verification is complete; it says document review may take a few days.
- [ ] Create the Play app record for internal testing. A new personal account can use internal testing; public production access requires 12 closed-test participants opted in continuously for 14 days and Google's approval.
- [x] Generate the Android upload keystore through EAS for `com.chrfalch.oslooffsite2026`.
- [ ] Confirm Play App Signing after Play Console enrollment.
- [x] Create and verify a Google service-account submission key and assign it in EAS.
- [ ] Grant that service account app-scoped testing permissions after Google unlocks app creation.
- Google Cloud terms were accepted by the user. Project `chrfalch-oslo-offsite-2026` and service account `eas-submit@chrfalch-oslo-offsite-2026.iam.gserviceaccount.com` are created. No Cloud IAM roles were granted to the service account. Android Publisher API is enabled. The locally generated key `7bc68e12694cec6434b4e9a5aac47c96fe924dcf` authenticated successfully with Google and is assigned in EAS for this app (EAS credential ID `8071c411-5f38-454d-94b8-b5966438a3af`), expiring 2027-09-09. Its local JSON and PEM files have restricted permissions in ignored `credentials/`. Play app permissions must wait for app creation. Both unused Google-generated keys from failed browser downloads were deleted after the user's explicit approval. The working key is retained.
- [x] Configure the subsequently requested embedded Android Maps and billing; see the current Maps status above. The original beta used the external Google Maps button.
- [x] Keep passwords, private keys, keystores, and service-account JSON out of Git and chat.

## 4. Expo Updates

- [x] Install expo-updates at `58.0.0-canary-20260902-26df09e`.
- [x] Run eas update:configure and review its changes. The existing dynamic configuration preserves the generated app.json settings.
- [x] Configure development/preview/production channels and matching build environments; EAS selected the appVersion runtime policy and project-specific update URL. Verify native settings in the built artifacts before publishing updates.
- [x] Document update publication, validation, and rollback steps in `docs/RELEASING.md`.
- [x] Publish the unchanged app snapshot to the isolated preview channel for delivery testing: group `9c5b500c-350c-4e74-ac02-63edd1b5f465`, runtime `1.0.0`. iOS update `01a08553-8ecf-72cd-81ea-a2dfda48f9ab`; Android update `01a08553-8ecf-7b63-b196-0d2d2693c602`. No production OTA has been published.
- [x] Validate update delivery on both release platforms: Observe reports nine events from iOS OTA `01a08553-8ecf-72cd-81ea-a2dfda48f9ab` and 12 from Android OTA `01a08553-8ecf-7b63-b196-0d2d2693c602`. The events appeared in queries after ingestion delay.

## 5. Expo Observe

- [x] Install expo-observe at `58.0.0-canary-20260902-26df09e`.
- [x] Add ObserveRoot and interactive timing after the preference-gated screens mount.
- [x] Enable Expo Router navigation metrics, filtering dynamic `id` and `key` parameters. Use the installed update channel to label the telemetry environment; default debug dispatch stays disabled.
- [x] Confirm native compilation of Observe/AppMetrics and source-map uploads in the final iOS and Android EAS build logs. Verify Observe CLI access.
- [x] Verify native release compatibility and receipt of metrics in EAS on both platforms: 32 iOS events and 26 Android events from one test installation each, observed 2026-09-09. Both include the applied preview OTA. Detailed metric queries require a paid EAS subscription; the version/event-count query works on the current Free account.
- [x] Prepare the actual Observe telemetry inventory and public privacy policy in `docs/PRIVACY-REVIEW.md`.
- [ ] Apply that inventory to any store privacy forms required when the Play listing becomes available or distribution expands.

## 6. Store preparation and validation

- [x] Confirm tester audience: only offsite attendees, as requested. Attendee selection does not authenticate users; distribute the beta only to the intended attendees because travel and accommodation details are bundled.
- [x] Draft descriptions, review instructions, beta notes, and SDK privacy inventory in `docs/STORE-LISTING.md` and `docs/PRIVACY-REVIEW.md`. Prepare public privacy/support text in `docs/PRIVACY-POLICY.md` and `docs/SUPPORT.md`.
- [x] Confirm beta feedback, support, and privacy contact for both platforms: `christian@expo.dev`. Account login emails are unchanged.
- [x] Save the TestFlight English beta description, feedback email, and privacy URL. Create the empty external group `Offsite attendees` (`b97c3a33-e50a-4fb0-9702-19bbbb757b8b`) with public links disabled. No invitations were sent. Apple review details, including the user-provided private phone number, are saved and verified. The local phone value stays in ignored `.env.store-review` with restricted file permissions.
- [x] Create the requested Oslo Offsite launcher icon and apply it on both platforms. Expo-generated iOS icon is 1024 × 1024 without alpha; Android generated icon inspected at launcher size. Beta description and release notes are prepared in `docs/STORE-LISTING.md`.
- [x] Publish and verify support/privacy pages on EAS Hosting: https://oslo-offsite-2026.expo.app/ and https://oslo-offsite-2026.expo.app/privacy.html. Latest deployment `5sr6vh8gms`; only public support/privacy text and CSS are included. Both links also opened successfully from the iOS release preview's Profile screen.
- [x] Prepare `store.config.json` through EAS Metadata, with the published URLs and manual release. Local EAS metadata validation passes; no metadata push or public release has occurred. The age questionnaire accounts for infrequent references to bars/alcohol in the guide.
- [x] Complete and verify Apple's private beta review contact, including the provided phone number.
- [x] Complete the private TestFlight submission requirements: beta metadata, privacy URL, review contact, build notes and export compliance. Apple accepted the beta review submission.
- [ ] Complete Google's applicable app setup forms after verification unlocks its listing. Listing screenshots and full store privacy labels remain necessary before broader distribution where required.
- [x] Run local validation after integration: 50 current data tests pass and TypeScript/lint pass after subsequent content changes. Dependency checks, Expo Doctor (20/20), and all-platform production exports passed on the earlier snapshot. The source changed after cloud uploads, so prepare fresh final candidates once release details are settled.
- [x] Inspect the EAS source archive: generated native projects and credentials are excluded, and release configuration/dependencies are included.
- [x] Validate cloud prebuild configuration and signing setup: both production builds finished successfully.
- [x] Build iOS and Android release artifacts on EAS, without automatic submission.
- First iOS production build: `f01eaa8e-6292-4d1a-91df-4f544022abb5`, version 1.0.0 (1), finished successfully at 2026-09-09 08:18 UTC. Matching preview release passed native launch checks.
- First Android production build: `95e8502c-43b1-403d-aac6-8617cd7143e2`, version 1.0.0 (2), finished successfully at 2026-09-09 08:32 UTC.
- [x] Inspect the signed iOS artifact: strict signature verification passes against macOS trust, team/bundle/version match, provisioning permits TestFlight and expires 2027-09-09, Updates is enabled on `production` with runtime `1.0.0`, and embedded EAS project identity matches.
- [x] Inspect the Android AAB: JAR signature verifies, upload certificate fingerprints match EAS, four native ABIs are included, and embedded EAS project/update configuration matches. The upload key is self-signed, as expected for Android; Play App Signing still needs enrollment.
- iOS preview simulator build for QA: `b2be4559-1f4b-433c-bb3e-3b148224729a`, finished successfully. EAS session `01a0854c-265d-7a71-be76-d66ef5524c87` stopped after testing. Onboarding, attendee persistence, packing-item persistence across process restart, and embedded Apple Maps rendering passed on iPhone 17 / iOS 26.5.
- Android preview APK build for QA: `813c0e80-af0b-4cc0-beec-e8154dc9ea81`, finished successfully at 2026-09-09 08:45 UTC. Android 15 / API 35 EAS checks passed: onboarding, attendee and packing persistence after restart, external Google Maps handoff to Sukkerbiten at `59.905115, 10.752999`, Observe and OTA application. EAS session `01a08560-fde5-71d9-9f07-6a804f40458f` was stopped after testing. Both cloud test sessions are stopped.
- Preview Updates endpoint returns HTTP 200 with the expected platform-specific update IDs and runtime `1.0.0`; the iOS preview artifact requests channel `preview`. Both platforms' OTA application is confirmed by Observe.
- Android submit profile resolves to the `internal` track with release status `completed`. EAS-managed Google submission credentials cannot be attached to a Play app until account verification permits app creation.
- [x] Validate release launches, onboarding, preferences and maps on both platforms, native offline behavior on Android, and Updates/Observe delivery on both platforms. iOS offline behavior has shared data-test coverage; a complete native iOS offline run was not performed.
- Native launch/onboarding, attendee and packing persistence, Maps, Updates and Observe passed for the validation builds. Current native Android offline checks also pass. The final UI snapshot was applied to both release preview binaries and verified before the final store submission. Store artwork is integrated and validated. Android cloud screenshots work at quarter size; full-resolution capture returned a controller size-mismatch error.
- [x] Record exact build IDs and review the prepared upload destinations. Candidate build IDs below are retained for audit; newer concurrent UI work still needs a fresh verified upload build.
- The first refreshed candidates (`87d9d6ae-304e-4e70-8562-5fa2f5b4deae`, `af7662c4-a4d6-433a-9ea3-70a301ccbd24`) and their previews (`990b0496-aa2b-425e-9865-4d231e128706`, `17bafd27-91e9-4fa5-9935-973d601cecaa`) were canceled before upload to include in-app Privacy and Support links. Their source digest was `ed7e1d5f8b79edf20873de187630c8339f57f7d7d9dbc7a65024043153b1ca84`; do not submit them.
- Replacement release and preview builds started with source/config/asset digest `2e1f13e6bad467beb3d5b63bc0d835fc1a2e028d3811cd584bd9d302eb402533`. TypeScript, lint, diff checks and all-platform exports passed after adding the profile links. Existing 50 data tests passed before this UI-only change. No automatic submission is enabled.
- Replacement iOS production: `2a8b2c0f-0881-4c3f-a597-6b3c5dfb5d53`, version 1.0.0 (3), finished at 09:56 UTC. Android production: `4061977b-74ed-48e5-89fb-56855117e617`, version 1.0.0 (4), finished at 09:57 UTC. iOS preview: `bcaa890b-150b-49aa-acc2-3096822e0cfa`, finished at 09:50 UTC; actual simulator binary is build 1 although EAS reports build 2 (preview does not auto-increment). Android preview: `737513f8-bea5-42c4-8024-39b48b280c60`, build 4, finished at 09:57 UTC. App code/config/assets stayed unchanged throughout all four uploads.
- [x] Verify the replacement artifacts: iOS strict code signature, bundle/version, icon and production Updates configuration pass; Android AAB signature and upload certificate match EAS. All 48 inspected 64-bit Android native libraries meet 16 KB ELF alignment, and the preview APK passes 16 KB ZIP alignment verification.
- [x] Verify refreshed iOS onboarding and in-app Privacy/Support links on a fresh local iPhone 17 Pro Max / iOS 26.5 simulator. Both published pages rendered successfully. This was an interactive check; the recorder's SwiftUI selector mismatch prevented a reliable saved replay, so no passing automated flow is claimed.
- [x] Include and validate the newer UI changes before store upload. See the current release status above. Historical boundary: At 10:13 UTC, 18 existing source files and 16 new source files differed from the 09:41 UTC build snapshot, including shared controls, screen presentations, and Oslo-time behavior. Preserve those concurrent edits. Current workspace checks at 10:11 UTC passed all 53 tests, TypeScript, and lint; they do not establish native behavior or inclusion in the already finished builds.
- Native Android offline and refreshed UI checks are now complete (see current status above). EAS iOS submission has completed successfully; no production OTA or attendee invitations have occurred.

## 7. Upload after preparation

- [x] Submit the verified iOS build to TestFlight with EAS Submit: 1.0.0 (4), submission `5b251776-4099-4974-9024-b37af52befcd`, successful; Apple processing `VALID`.
- [ ] Submit the verified Android build to the confirmed Google Play testing track with EAS Submit (check current first-upload requirements).
- [x] Confirm Apple processing (`VALID`) and external beta review submission (`WAITING_FOR_REVIEW`).
- [ ] After Google identity approval: verify contact phone, create the app, grant app-scoped testing access, enroll Play App Signing, add its SHA-1 to the Maps key, and submit the verified Android Maps build recorded above via EAS. Confirm Play processing and map rendering.
- [ ] Once Apple approves the beta, collect the attendee tester addresses and authorize invitations. The group is empty and public links remain disabled.

## Initial audit

- App version: 1.0.0.
- Expo SDK: 58.0.0-canary-20260902-26df09e; React Native 0.87.0.
- Native folders are generated and ignored by Git.
- No eas.json, EAS project ID, expo-updates, or expo-observe at the initial audit.
- Local EAS CLI: 20.5.1; reported available update: 23.2.0.
- Existing native compatibility fixes and pinned template are documented in README.md.
- Existing launcher artwork is described as Expo template placeholders in README.md; review against the intended release branding.
- Expo's current Android submission documentation supports a first submission through EAS directly to internal testing once the Play app record and service-account credentials exist: https://docs.expo.dev/submit/android/.
- The required SDK 58 documentation URL returned HTTP 404. The user explicitly approved https://docs.expo.dev/versions/unversioned/ plus verification against installed packages before source changes.
- Source data files changed during the audit in concurrent workspace work. Preserve those edits and rerun final validation against the exact release snapshot.

Do not mark cloud builds, credential verification, telemetry delivery, or store uploads complete based only on local configuration.
