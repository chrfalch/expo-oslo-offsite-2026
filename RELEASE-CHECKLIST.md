# Oslo Offsite 2026 release checklist

Prepare and validate everything before uploading. Use EAS Build, EAS-managed signing credentials, EAS Update, EAS Observe, and EAS Submit. Audience confirmed: only offsite attendees. Destinations: a private TestFlight beta and Google Play internal testing. Ask setup questions one at a time.

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
- [ ] Configure a Google Play service account with the required app/track permissions in EAS.
- Google Cloud is signed into `christian.falch@mezzin.no` but is showing its first-use Terms of Service dialog. No project/service account has been created and no terms were accepted by the agent. The setup page is left open for the user; complete this after the pending Apple review-phone question.
- [x] Confirm Android map behavior: the user chose the working external Google Maps button for this beta. An embedded Maps key and billing are not needed for this release.
- [ ] Keep passwords, private keys, keystores, and service-account JSON out of Git and chat.

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
- [x] Confirm iOS cloud compilation of Observe/AppMetrics and source-map upload. Verify Observe CLI access.
- [x] Verify native release compatibility and receipt of metrics in EAS on both platforms: 32 iOS events and 26 Android events from one test installation each, observed 2026-09-09. Both include the applied preview OTA. Detailed metric queries require a paid EAS subscription; the version/event-count query works on the current Free account.
- [ ] Include Observe's actual telemetry in store privacy declarations.

## 6. Store preparation and validation

- [x] Confirm tester audience: only offsite attendees, as requested. Attendee selection does not authenticate users; distribute the beta only to the intended attendees because travel and accommodation details are bundled.
- [x] Draft descriptions, review instructions, beta notes, and SDK privacy inventory in `docs/STORE-LISTING.md` and `docs/PRIVACY-REVIEW.md`. Prepare public privacy/support text in `docs/PRIVACY-POLICY.md` and `docs/SUPPORT.md`.
- [x] Confirm beta feedback, support, and privacy contact for both platforms: `christian@expo.dev`. Account login emails are unchanged.
- [x] Save the TestFlight English beta description, feedback email, and privacy URL. Create the empty external group `Offsite attendees` (`b97c3a33-e50a-4fb0-9702-19bbbb757b8b`) with public links disabled. No invitations were sent. Apple review details, including the user-provided private phone number, are saved and verified. The local phone value stays in ignored `.env.store-review` with restricted file permissions.
- [x] Create the requested Oslo Offsite launcher icon and apply it on both platforms. Expo-generated iOS icon is 1024 × 1024 without alpha; Android generated icon inspected at launcher size. Beta description and release notes are prepared in `docs/STORE-LISTING.md`.
- [x] Publish and verify support/privacy pages on EAS Hosting: https://oslo-offsite-2026.expo.app/ and https://oslo-offsite-2026.expo.app/privacy.html. Latest deployment `5sr6vh8gms`; only public support/privacy text and CSS are included. Both links also opened successfully from the iOS release preview's Profile screen.
- [x] Prepare `store.config.json` through EAS Metadata, with the published URLs and manual release. Local EAS metadata validation passes; no metadata push or public release has occurred. The age questionnaire accounts for infrequent references to bars/alcohol in the guide.
- [x] Complete and verify Apple's private beta review contact, including the provided phone number.
- [ ] Complete applicable store privacy declarations and any screenshots needed for the selected beta/store flow.
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
- [ ] Validate release launches, onboarding, preferences, maps, offline guide, Updates, and Observe.
- Native launch/onboarding, attendee and packing persistence, Maps, Updates and Observe passed for the validation builds. Offline data loading passes with networking disabled in the automated tests. Full native offline smoke checks, final artwork/screenshots, and tests of the refreshed upload candidates remain. Android cloud screenshots work at quarter size; full-resolution capture returned a controller size-mismatch error.
- [x] Record exact build IDs and review the prepared upload destinations. Candidate build IDs below are retained for audit; newer concurrent UI work still needs a fresh verified upload build.
- The first refreshed candidates (`87d9d6ae-304e-4e70-8562-5fa2f5b4deae`, `af7662c4-a4d6-433a-9ea3-70a301ccbd24`) and their previews (`990b0496-aa2b-425e-9865-4d231e128706`, `17bafd27-91e9-4fa5-9935-973d601cecaa`) were canceled before upload to include in-app Privacy and Support links. Their source digest was `ed7e1d5f8b79edf20873de187630c8339f57f7d7d9dbc7a65024043153b1ca84`; do not submit them.
- Replacement release and preview builds started with source/config/asset digest `2e1f13e6bad467beb3d5b63bc0d835fc1a2e028d3811cd584bd9d302eb402533`. TypeScript, lint, diff checks and all-platform exports passed after adding the profile links. Existing 50 data tests passed before this UI-only change. No automatic submission is enabled.
- Replacement iOS production: `2a8b2c0f-0881-4c3f-a597-6b3c5dfb5d53`, version 1.0.0 (3), finished at 09:56 UTC. Android production: `4061977b-74ed-48e5-89fb-56855117e617`, version 1.0.0 (4), finished at 09:57 UTC. iOS preview: `bcaa890b-150b-49aa-acc2-3096822e0cfa`, finished at 09:50 UTC; actual simulator binary is build 1 although EAS reports build 2 (preview does not auto-increment). Android preview: `737513f8-bea5-42c4-8024-39b48b280c60`, build 4, finished at 09:57 UTC. App code/config/assets stayed unchanged throughout all four uploads.
- [x] Verify the replacement artifacts: iOS strict code signature, bundle/version, icon and production Updates configuration pass; Android AAB signature and upload certificate match EAS. All 48 inspected 64-bit Android native libraries meet 16 KB ELF alignment, and the preview APK passes 16 KB ZIP alignment verification.
- [x] Verify refreshed iOS onboarding and in-app Privacy/Support links on a fresh local iPhone 17 Pro Max / iOS 26.5 simulator. Both published pages rendered successfully. This was an interactive check; the recorder's SwiftUI selector mismatch prevented a reliable saved replay, so no passing automated flow is claimed.
- [ ] Build and validate the newer UI changes before store upload. At 10:13 UTC, 18 existing source files and 16 new source files differed from the 09:41 UTC build snapshot, including shared controls, screen presentations, and Oslo-time behavior. Preserve those concurrent edits. Current workspace checks at 10:11 UTC passed all 53 tests, TypeScript, and lint; they do not establish native behavior or inclusion in the already finished builds.
- Full native offline checks and refreshed Android UI checks remain outstanding. No store submission, production OTA, or attendee invitations have occurred.

## 7. Upload after preparation

- [ ] Submit the verified iOS build to TestFlight with EAS Submit.
- [ ] Submit the verified Android build to the confirmed Google Play testing track with EAS Submit (check current first-upload requirements).
- [ ] Confirm processing status and report any remaining store-side actions.

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
