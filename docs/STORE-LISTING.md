# Store preparation — Oslo Offsite

Draft release information for review before store submission. The confirmed audience is only offsite attendees. Prepare a private TestFlight beta and Google Play internal testing.

## Identity

- Display name: Oslo Offsite
- Version: 1.0.0
- Language: English (US)
- Suggested category: Travel
- Bundle/package identifier: `com.chrfalch.oslooffsite2026`
- App Store Connect app ID: `6810129391`
- Apple publisher: Christian Magnus Falch
- Planned Google Play publisher: Christian Magnus Falch (personal account; the shorter developer name is already registered)
- Beta feedback, support, and privacy contact: `christian@expo.dev` (confirmed for both platforms)
- Support URL: https://oslo-offsite-2026.expo.app/
- Privacy policy URL: https://oslo-offsite-2026.expo.app/privacy.html
- Both pages are accessible from Profile → Privacy and support in the release candidate.

## Short description

Your team's guide to the Oslo offsite: schedule, travel, places and packing.

## Description

Keep the Oslo offsite close at hand. See the shared schedule, find your travel details, explore places around the city, and keep track of what to pack.

Choose your attendee profile to see your arrival and save your own places and packing checklist on this device. Browse accommodation, food, practical information, and activities from the bundled guide. Open destinations in Maps when you're ready to go.

The guide and your saved preferences work offline. Map tiles, external websites, and app updates require an internet connection.

## First beta release notes

Welcome to Oslo Offsite.

- Choose your attendee profile and review your travel details.
- Browse the shared schedule, places, food, accommodation, and practical guide.
- Save places and track your packing checklist on your device.
- Open destination maps and directions.

Please test first launch, switching attendees, saved preferences after restarting, the offline guide, and Maps handoff. Report any incorrect itinerary or location details to the organizer.

## Review instructions

The app does not use account authentication. On first launch, select one of the listed attendees and continue. Use the profile screen to change attendee later. Selection personalizes this device and does not verify the user's identity.

All guide content is bundled with the app. Apple Maps is used on iOS. Android opens destinations using its external Google Maps button for this beta. The app does not request the device's location.

## Outstanding release information

- Restrict beta access to the offsite attendees; attendee selection is not authentication.
- Oslo Offsite launcher artwork is configured for both platforms in `assets/branding/oslo-offsite-icon.png`; verify generated native icons in the final builds.
- Capture current release screenshots after native validation.
- Support and privacy pages are published on EAS Hosting at the URLs above; all three public assets returned HTTP 200 on 2026-09-09.
- Apple beta contact information, including the private review phone, is saved and verified.
- Complete store privacy/data-safety declarations using the shipped SDK behavior.
- Finish Google identity approval and contact-phone verification, then create the app for internal testing.

## Privacy facts to use when preparing declarations

- Attendee selection, saved place IDs, and packed-item IDs are stored with AsyncStorage on the device. There is no app account or cross-device sync.
- The guide includes team information in the distributed application bundle; attendee selection does not restrict access to that information.
- EAS Update checks Expo for compatible updates and downloads JavaScript and assets.
- Expo Observe sends performance and diagnostic telemetry to Expo, including installation/session and device context provided by the SDK. Inspect the SDK's exact fields before choosing store declaration categories.
- The app does not add attendee names, saved places, or packing choices to Observe events. Navigation telemetry filters dynamic route `id` and `key` values.
- Apple/Google map services and websites opened from the app receive requests under their own policies.
- The app has no advertising, payments, or in-app purchases in its current source.

Do not submit a "no data collected" declaration without accounting for Observe, Updates, and map SDK behavior. Final declarations and the privacy policy must match the actual released configuration.

## TestFlight setup saved

`docs/testflight-beta.json` contains the prepared English beta description and review instructions. App Store Connect has the beta description, feedback email, privacy URL, and empty external group `Offsite attendees` (`b97c3a33-e50a-4fb0-9702-19bbbb757b8b`). Public links are disabled. Apple review details, including the private phone, are saved and verified. Build 1.0.0 (4), App Store Connect build `da36f042-917e-4ea1-8af0-353995759957`, has processed successfully and is assigned to this group. Beta notes are saved and external beta review is `WAITING_FOR_REVIEW`. Automatic notifications are disabled. Tester addresses and invitations remain outstanding.
