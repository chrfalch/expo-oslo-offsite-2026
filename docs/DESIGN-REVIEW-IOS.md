# Oslo Offsite — iOS design review

Follow-up: [implemented changes and validation](DESIGN-FIXES-IOS.md).

Reviewed 9 September 2026 using the Apple design skill, the running iPhone 17 Pro simulator on iOS 26.5, and the current source. Android should inherit the resulting hierarchy, content, and visual language, with its own native controls.

The app already has a coherent identity: lilac and amber, restrained surfaces, system typography, native navigation, and photographs that make Oslo feel tangible. The strongest next step is to make it a faster pocket guide. Essential information and actions currently compete with large images, introductory copy, and repeated card framing.

This is a review, with proposed changes below. App source and personal preferences were not edited. The simulator's light appearance and default text size were restored after inspection.

**What I inspected**

| Area | Evidence |
| --- | --- |
| Overview, Schedule, Oslo | Live screens, tab navigation, Schedule day selection |
| Places | Opening screen, result card, search for “pizza,” keyboard dismissal, empty Saved view |
| Place and activity details | Fuglen and the sauna activity |
| Locations | Embedded Apple map, sheet presentation, swipe dismissal back to the place |
| Bases | Workspace, accommodation overview, horizontal apartment photo paging |
| Food | Out & about and Supermarket |
| Practical | FAQ, Travel info, and Expo apps |
| Personal | Profile, attendee selection, Packing at default and largest accessibility text sizes |
| Appearance and implementation | Dark Overview and Practical screens; shared components and installed Expo UI adapters |

The first-run onboarding variant was reviewed in source; its shared attendee selector was inspected through Change attendee. Some secondary screens were opened by deep link. This was not an exhaustive navigation regression run, a spoken VoiceOver audit, or a measurement of animation frame rate. Android and smaller iPhones were not tested.

**1. High priority — make all reading text follow Dynamic Type**

At the largest accessibility text setting, Packing's item labels become large while the explanations, introductory text, and “0 of 6 packed” heading remain small. A person who needs larger text can read the item but still cannot comfortably read its instructions.

This is confirmed in the implementation: the universal Text adapter converts the app's numeric font sizes into a fixed-size SwiftUI system font. The installed adapter supports semantic text styles, but the app's shared text components do not use them. Native control labels and app-authored text consequently scale differently.

Adopt semantic roles for title, headline, body, callout, and caption. Let rows and buttons grow with text, and recheck the hero's fixed-size year badge and profile control. Keep reading text around the platform body size at the default setting; reserve smaller type for genuinely secondary metadata. Apple's [typography guidance](https://developer.apple.com/design/human-interface-guidelines/typography?changes=_5) explains how text styles preserve hierarchy while supporting larger text.

Source: [InfoCard](/Users/chrfalch/repos/chrfalch/oslo-offsite-2026/src/components/info-card.tsx:27), [content text and packing explanations](/Users/chrfalch/repos/chrfalch/oslo-offsite-2026/src/presentation/content-page-view.tsx:33), [installed iOS text adapter](/Users/chrfalch/repos/chrfalch/oslo-offsite-2026/node_modules/@expo/ui/src/universal/Text/index.ios.tsx:62).

Acceptance: headings, descriptions, controls, and captions all respond coherently at the largest accessibility size, with essential text fully available and actions reachable.

| Default text size | Largest accessibility size |
| --- | --- |
| ![Packing at default text size](/Users/chrfalch/repos/chrfalch/oslo-offsite-2026/docs/design-review-assets/packing-default-text.png) | ![Large item labels beside unchanged small explanations](/Users/chrfalch/repos/chrfalch/oslo-offsite-2026/docs/design-review-assets/packing-largest-text.png) |

**2. High priority — put search results directly below search**

Places opens with an All places menu and a large filter card. The first result starts about 70% down the screen; its action is below the initial viewport. Typing “pizza” correctly produces four matches, but both the count and results are hidden behind the keyboard. The user gets little visible feedback while typing. Return dismisses the keyboard successfully.

Use a prominent native search field, a compact All/Saved selector, and one concise filter summary such as “All categories · From Rebel.” Put the less frequent filter choices in a native menu or sheet. Shorten the field placeholder and provide a clear affordance for clearing the query. Show the result count and at least one result while the keyboard is open.

Make results compact, tappable rows: thumbnail, name, category, and estimated walk from the selected base. Keep substantial photos and the full description on the detail screen. The current eight-result page already reports seven scroll pages; six pages of large cards make comparing 43 places unnecessarily laborious. A continuous list would better suit this small offline collection.

The Saved empty state should say “No saved places yet” when nothing has been saved, with a direct Browse places action. Reserve “No saved places match” for a real filter mismatch and offer Clear filters in that case.

Source: [Places layout](/Users/chrfalch/repos/chrfalch/oslo-offsite-2026/src/presentation/places-view.tsx:34), [pagination and result models](/Users/chrfalch/repos/chrfalch/oslo-offsite-2026/src/screens/places.tsx:11).

| Initial Places screen | Search with keyboard open |
| --- | --- |
| ![Filters dominate the opening Places screen](/Users/chrfalch/repos/chrfalch/oslo-offsite-2026/docs/design-review-assets/places-light.png) | ![Pizza search updates results underneath the keyboard](/Users/chrfalch/repos/chrfalch/oslo-offsite-2026/docs/design-review-assets/places-search-keyboard.png) |

**3. High priority — make Schedule read as an agenda**

Selecting Tuesday still leaves the large Rebel work card occupying almost the entire visible content area. The evening activity begins under the tab bar. The date and time are small metadata, while the workspace photograph receives most of the space.

Lead with the selected day, then chronological entries with prominent times, activity names, locations, and a clear route to the map. Represent the workday as a compact block. Keep the Rebel photo and fuller description in the workspace detail. During the offsite, open on today; before the offsite, use a clearly stated initial day or the week overview. Keep All days available.

A compact day strip could make movement through this seven-day event more direct; retain a menu alternative where larger text needs more space. This is a design proposal, not a claim that the current native menu is defective.

Source: [Schedule composition](/Users/chrfalch/repos/chrfalch/oslo-offsite-2026/src/screens/schedule.tsx:15).

Acceptance: on a working day with a shared activity, the work block and the next shared activity are both visible in the first viewport at default text size.

**4. Medium priority — give Overview a useful first screen throughout the trip**

The hero has personality and is worth keeping. Its current height, followed by the large upcoming photo, puts View activity, the map action, and Packing below the opening screen. The top travel row is always Your arrival, even later in the trip.

Reduce the event banner after onboarding and lead with timely information: arrival and packing before the trip, today's plan during it, and departure near the end. Put the next activity's time, location, and action together above its image. Include a short route to the workspace and accommodation without inventing apartment assignments that the data does not contain.

Use the same names as the tabs for Overview links: Schedule and Oslo are easier to recognize than a second set of names, The plan and The city.

Source: [Overview layout](/Users/chrfalch/repos/chrfalch/oslo-offsite-2026/src/presentation/overview-view.tsx:27), [Overview content selection](/Users/chrfalch/repos/chrfalch/oslo-offsite-2026/src/screens/overview.tsx:24).

| Overview | Schedule |
| --- | --- |
| ![Overview banner and large activity photograph](/Users/chrfalch/repos/chrfalch/oslo-offsite-2026/docs/design-review-assets/overview-light.png) | ![Workspace card pushes shared activities below the first screen](/Users/chrfalch/repos/chrfalch/oslo-offsite-2026/docs/design-review-assets/schedule-light.png) |

**5. Medium priority — establish consistent touch areas and action hierarchy**

The app's primary actions render as small capsules. Many reported accessibility frames are about 3.9% of screen height; the profile control is similarly compact. Some one-line navigation rows are even shorter. The screenshots and source justify a sizing pass, although these accessibility frames are not a complete physical hit-region audit.

Give app-owned interactive controls a reliable 44-point minimum hit area, with larger prominent controls where appropriate. Make navigation rows comfortable to tap across their full width. Enlarge the actual interactive label or content shape, not just a surrounding host. Apple recommends a [44 × 44 pt hit region as a general rule](https://developer.apple.com/design/human-interface-guidelines/buttons?changes=latest_1__8).

Use one prominent action for each task. Workspace currently puts its website above its map; arrival at the venue makes the map more useful. Place cards should open through the row or card itself, while a separate save control has its own clearly defined target. Use neutral text for passive navigation titles, reserving lilac emphasis primarily for actions and selection.

Source: [shared card actions](/Users/chrfalch/repos/chrfalch/oslo-offsite-2026/src/presentation/guide-card.tsx:33), [ActionRow](/Users/chrfalch/repos/chrfalch/oslo-offsite-2026/src/presentation/content-page-view.tsx:20), [profile control](/Users/chrfalch/repos/chrfalch/oslo-offsite-2026/src/presentation/overview-view.tsx:25).

**6. Medium priority — use controls that express the task**

Packing displays six iOS switches because the universal Checkbox resolves to a SwiftUI Toggle. The interaction works as a Boolean state, but visually suggests enabling settings. A Reminders-style completion circle, full-row tap target, and persistent checked state would communicate packing more directly. Keep the count, permit immediate undo, and avoid automatically removing checked items while someone is working through the list.

Short, frequent mode changes also deserve more visible controls. All/Saved, My trip/Everyone, and Out & about/Supermarket are good candidates for native segmented controls. Keep category selection in a menu; there are too many categories for segments. At accessibility sizes, let the mode control adapt instead of squeezing its labels.

Source: [packing controls and shared choices](/Users/chrfalch/repos/chrfalch/oslo-offsite-2026/src/presentation/content-page-view.tsx:34).

**7. Medium priority — improve accessible names and selection state**

The profile button is exposed as “H.” The attendee selector exposes literal filled and hollow circles as part of its button labels; the app does not explicitly provide the selected trait. The back button from Places to the tabs is exposed as “(tabs).” These names do not clearly express their purpose.

Name the profile action “Your profile,” expose selected attendee state semantically, hide decorative glyphs from the accessibility label, and use a meaningful back destination. Replace the text chevron with a properly scaled system symbol. Verify the resulting experience with VoiceOver, including the search field and sheet dismissal.

Source: [attendee selection](/Users/chrfalch/repos/chrfalch/oslo-offsite-2026/src/presentation/onboarding-view.tsx:24), [root navigation](/Users/chrfalch/repos/chrfalch/oslo-offsite-2026/src/app/_layout.tsx:64).

**8. Medium priority — distinguish useful facts from supporting documentation**

Accommodation begins with a long paragraph about booking verification, listing retrieval, and coordinate precision. The apartment's name and photos start far down the screen. Travel likewise puts extensive source reconciliation alongside the flight information. Location sheets display raw coordinates and source names prominently.

Lead accommodation with booked status, check-in time, capacity, and the available location action. Preserve a short, explicit approximate-location notice beside the map, then disclose provenance and longer explanations on demand. Lead Travel with the dates, times, flight, and origin/destination. Keep genuine uncertainty visible in one concise note; put the full reconciliation one level deeper. Do not manufacture missing addresses or present uncertain times as confirmed.

Practical's registration, booking instructions, and app directory should read as distinct topics. The current FAQ-only opening, with a small menu above it, makes the rest easy to overlook. An index of named rows would make the contents more apparent. App recommendations can use compact icon-leading rows rather than large cards.

Source: [accommodation and Practical](/Users/chrfalch/repos/chrfalch/oslo-offsite-2026/src/screens/guide.tsx:21), [travel presentation](/Users/chrfalch/repos/chrfalch/oslo-offsite-2026/src/screens/personal.tsx:44), [map information](/Users/chrfalch/repos/chrfalch/oslo-offsite-2026/src/presentation/location-view.tsx:55).

**What to preserve**

Keep the three-tab structure, native navigation, and native map sheet. Swipe dismissal returned to the place correctly, and apartment photo paging moved naturally to the next image. These interactions already support the Apple skill's principles of familiarity, direct manipulation, and spatial consistency. There is no evidence here for adding decorative spring animations or replacing native transitions.

Keep the lilac/amber identity and dark palette. The inspected dark screens retained a clear visual hierarchy. Keep large photographs where looking is the task, especially the food guide and accommodation gallery; give operational screens more compact imagery. The no-account attendee flow, persistent personal lists, and bundled guide content are good foundations.

Additional captured evidence: [dark Overview](/Users/chrfalch/repos/chrfalch/oslo-offsite-2026/docs/design-review-assets/overview-dark.png), [location sheet](/Users/chrfalch/repos/chrfalch/oslo-offsite-2026/docs/design-review-assets/location-sheet.png), [food guide](/Users/chrfalch/repos/chrfalch/oslo-offsite-2026/docs/design-review-assets/food-light.png), [accommodation](/Users/chrfalch/repos/chrfalch/oslo-offsite-2026/docs/design-review-assets/accommodation-light.png), [attendee selection](/Users/chrfalch/repos/chrfalch/oslo-offsite-2026/docs/design-review-assets/attendee-selection.png), and [empty Saved view](/Users/chrfalch/repos/chrfalch/oslo-offsite-2026/docs/design-review-assets/saved-empty.png).

**Recommended implementation order**

1. Establish scalable text roles, dependable touch areas, and meaningful accessibility labels in the shared components.
2. Rework Places and Schedule so their first viewport answers the user's immediate question.
3. Tighten Overview, adopt completion controls for Packing, and improve short mode selectors.
4. Edit information hierarchy in accommodation, travel, and Practical; refine the shared row, card, and detail treatments.

Validate the resulting iOS design on a smaller iPhone, at default and largest accessibility text sizes, in both appearances, with VoiceOver and Reduce Motion. Physical-device review is still needed for touch comfort and motion quality. Android should then receive the same content priorities, spacing roles, and readable hierarchy through its native presentation.

The project pins Expo SDK 58 canary. The required versioned documentation URLs could not be retrieved during this review; API observations above were checked against the installed package source. No application code was written.
