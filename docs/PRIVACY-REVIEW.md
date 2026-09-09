# Release privacy review

Prepared on 2026-09-09 from the app source, the installed Expo SDK 58 canary packages, and the first signed iOS artifact. This is a technical inventory for preparing the privacy policy and store declarations. No declarations have been submitted.

## App data

The app bundles the offsite guide, attendee names, travel details, and accommodation information. Selecting an attendee personalizes the device; it does not authenticate the person or restrict access to the bundled information. The user confirmed distribution only to the offsite attendees.

The selected attendee, saved places, and packing choices are stored locally with AsyncStorage. The app has no account service, advertising, payment processing, or backend for synchronizing those preferences. The source adds no attendee identifiers or preference values to Observe events. It does not request the device's location or access the user's photo library.

## Expo telemetry in the shipped packages

`expo-observe`, `expo-app-metrics`, and `expo-eas-client` are pinned to `58.0.0-canary-20260902-26df09e`. The inspected native implementations record:

| Data | Purpose and behavior |
| --- | --- |
| Random installation ID and per-launch session IDs | Associate diagnostics across launches of the same installation. The installation ID is generated locally and saved in app preferences; it is not an advertising ID. |
| App, build, SDK, update, runtime, and channel versions | Identify the software producing the events. |
| OS version, device model, and language | Compare behavior across device configurations. The device name field is a model designation, not the user's custom device name. |
| Startup and navigation timings, route names | Measure first render and readiness. Dynamic route parameters `id` and `key` are filtered by this app's Router integration. |
| Frame, memory, battery, thermal, and network state | Diagnose performance under different conditions. Availability varies by platform and event. |
| Network timing summaries | Counts, bytes, timing, status, and slowest request hostname. The automatic timing summary does not serialize full request URLs or bodies. |
| Error messages, stack traces, and crash diagnostics | Diagnose failures. The installed canary contains JavaScript error reporting and native crash-reporting code; delivery and coverage still require runtime verification. |

The native Observe serializers attach the installation ID to outbound telemetry. Debug dispatch remains disabled. Release telemetry uses Expo's default endpoints, with the EAS channel as its environment. The app does not add a custom user identity or third-party telemetry destination.

EAS Update also makes network requests to Expo for compatible updates and assets. Check the runtime's actual requests and Expo's current service practices before finalizing retention, deletion, and data-sharing statements. Do not promise that reinstalling removes telemetry already held by Expo.

Expo's current metrics documentation states that metric data is retained for a minimum of 60 days. This is a minimum, not a guaranteed deletion date. Local preferences persist until cleared or the application data is removed; removing local app data does not delete already dispatched telemetry.

Evidence in installed source: `expo-observe/ios/OpenTelemetry.swift`, `expo-app-metrics/ios/Storage/DeviceInfo.swift`, `expo-app-metrics/ios/Database/SessionRow+Builder.swift`, `expo-app-metrics/ios/NetworkRequests/NetworkRequestSummary.swift`, corresponding Android implementations, `expo-eas-client` ID storage, and `expo-app-metrics/src/installErrorHandler.ts`.

## Maps and external links

iOS uses Apple Maps. Android's first build has no Google Maps API key and uses the existing external Maps fallback. Enabling embedded Google Maps is a native configuration change and requires reviewing Google's SDK disclosure guidance. Opening a map or website passes the selected destination to that service; this is distinct from obtaining the device's current location.

The Android preview artifact targets API 36 (minimum API 24) and contains no location permission. Its merged manifest includes network access/state, wake/boot/foreground-service permissions, vibration, overlay access, and legacy external-storage permissions limited to API 32. The app source does not request overlay or external-storage access. Recheck the final store artifact; manifest permissions alone do not prove data collection.

## Store declaration preparation

The following are candidate categories to validate against runtime evidence and each store's definitions, not submitted answers:

| Observed behavior | Apple categories to review | Google categories to review |
| --- | --- | --- |
| Installation identifier | Identifiers: Device ID | Device or other IDs |
| Launch and navigation events | Usage Data: Product Interaction | App activity: App interactions |
| Startup and device performance | Diagnostics: Performance Data / Other Diagnostic Data | App info and performance: Diagnostics / Other app performance data |
| Exceptions and crash reports | Diagnostics: Crash Data | App info and performance: Crash logs |

The technical purpose is analytics and app reliability. The source contains no advertising or cross-app advertising tracking. Do not equate a random identifier with a blanket "no data collected" or "not linked" answer; assess how retained events are associated and used. Review Google's service-provider exception before deciding whether sending data to Expo constitutes "sharing" under its form.

Prepared Apple answers for the five categories above: collected, used for analytics and app functionality, linked through a persistent installation/device identifier, and not used for tracking. This linkage classification follows Apple's definition, which includes linkage via a device; the app does not send attendee identity with telemetry. Apple services such as MapKit collect under Apple's own disclosures. The table does not imply that attendee selection or saved preferences are uploaded.

For Google, prepare the four categories above as collected for analytics and app functionality, with collection required in the current app (there is no telemetry opt-out). The installed SDK sends HTTPS requests. Internal-testing-only apps are exempt from the public Data safety section; finish its form if moving to closed, open, or production tracks. The service-provider exception should only be selected for Expo processing performed on the developer's behalf under the applicable service terms. No store privacy form has been submitted.

The profile screen links directly to the published privacy policy and support page. Apple's review guidelines require an accessible privacy link inside the app in addition to store metadata.

The first iOS artifact includes 12 privacy manifests. Its app-level manifest declares required-reason API uses for UserDefaults (`CA92.1`), file timestamps (`C617.1`), and system boot time (`35F9.1`). It has `NSPrivacyTracking: false` and an empty collected-data list. That generated list does not replace the telemetry inventory or the store privacy form.

## Information still needed

- Privacy, support, and beta feedback contact confirmed: `christian@expo.dev`. Published support: https://oslo-offsite-2026.expo.app/; privacy: https://oslo-offsite-2026.expo.app/privacy.html. Both verified reachable on 2026-09-09.
- Release telemetry reaches EAS from both iOS and Android. Detailed event inspection is unavailable on the current Free plan.
- Confirm service retention/deletion behavior and the published policy wording.
- Recheck the Maps declaration if embedded Google Maps is enabled.
- Enter accurate store declarations before the applicable store release step using the published privacy policy.

## Sources

- [Expo Observe metrics and data handling](https://docs.expo.dev/eas/observe/reference/metrics/)
- [Expo installation client ID](https://docs.expo.dev/eas/observe/reference/client-id/)
- [Apple privacy categories and collection definitions](https://developer.apple.com/app-store/app-privacy-details/)
- [Google Play Data safety definitions](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en)
- [Google Maps SDK disclosure guidance](https://developers.google.com/maps/documentation/android-sdk/play-data-disclosure)
