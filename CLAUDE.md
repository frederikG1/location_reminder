# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run start          # expo start — dev server (scan QR / press i or a)
npm run ios            # expo run:ios — native iOS build
npm run android        # expo run:android — native Android build
npm run web            # expo start --web
npm run lint           # expo lint (flat config: eslint-config-expo)
npx tsc --noEmit        # typecheck (strict mode, no build script wraps this)
```

```bash
node scripts/generate-icons.mjs   # regenerate app icon / splash / favicon from the pin SVG
```

There is no test framework configured (no Jest/RNTL, no `test` script) — do not assume one exists.

`npx expo run:ios` needs a UTF-8 locale or CocoaPods dies with `Encoding::CompatibilityError`; prefix with `LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8` if your shell doesn't set it.

Background location and geofencing (the app's core feature) do not function in the iOS Simulator or most Android emulators; verify those flows on a real device. `npm run reset-project` is the stock create-expo-app scaffold-reset script, unrelated to this app's domain — don't run it.

## Architecture

**Expo Router (file-based), all screens under `app/`:**
- `/` (`app/index.tsx`) — home list. Gates on `useOnboardingStatus()`: renders nothing while loading, `<Redirect href="/onboarding" />` while onboarding is incomplete.
- `/onboarding` (`app/onboarding.tsx`) — first-run flow, `gestureEnabled: false`, no swipe-back.
- `/map` (`app/map.tsx`) — all saved places on one map.
- `/places/[id]` (`app/places/[id].tsx`) — detail/edit/delete for one place, plus a "Flyt" mode that makes the mini-map interactive and the marker draggable.
- `/settings` (`app/settings.tsx`) — pause reminders, permission status, replay onboarding, delete all data.

Root layout (`app/_layout.tsx`) wraps everything in `GestureHandlerRootView` → `ErrorBoundary` → `LocationProvider`, themes the native `Stack` header from `src/theme`, imports `src/tasks/geofencingTask` purely for its side effect (registers the background task at app boot), and calls `useNotificationDeepLink()` to route a tapped notification to `/places/[id]`.

**Data model & persistence.** The only domain type is `Place` (`src/models/Place.ts`: id, name, note?, latitude, longitude, radius, createdAt). There is no backend — `src/services/placeRepository.ts` persists the entire array as one JSON blob in AsyncStorage under the key `"places"`.

**No shared store — every screen calls `usePlaces()` independently.** `usePlaces` (`src/hooks/usePlaces.ts`) holds its own `useState<Place[]>` and reloads from AsyncStorage on mount; there's no context/Redux/Zustand tying instances together. Cross-screen consistency works because each screen remounts and re-reads, plus `create`/`update`/`remove` all call `refresh()` internally. When adding a feature that needs live cross-screen sync, be aware of this — it's the single biggest structural gap in the app.

**Geofencing has two independent code paths that must stay in sync:**
1. `usePlaces` re-syncs geofences via `src/services/geofencing.ts` (`syncGeofences`) whenever the places array changes *and* background permission is already granted, gated by a module-level `geofencesSynced` flag and a `hasLoaded` state flag (the flag is deliberately not set until the first AsyncStorage load completes — syncing against the empty initial state would latch it and leave real places unarmed). Code outside the hook that changes the preconditions (e.g. the settings screen's pause switch) calls the exported `invalidateGeofenceSync()` to clear the latch.
2. `src/tasks/geofencingTask.ts` defines the actual `expo-task-manager` background task (`GEOFENCING_TASK_NAME = "location-reminder-geofencing"`). This runs in a separate headless JS context on geofence-enter events, so it **cannot** use the `usePlaces` hook — it reads AsyncStorage directly via its own `getStoredPlaces()`, independent of the repository module.

`syncGeofences` dedupes on a signature built from **id + latitude + longitude + radius**, not id alone — an id-only comparison silently drops edits to a place's radius or position. It also arms at most `MAX_MONITORED_REGIONS` (20, the iOS per-app limit), picking the ones nearest the last known position; the home screen surfaces a note when there are more places than that. The background task suppresses repeat notifications for a region whose most recent `Visit` is under 30 minutes old, since standing on a boundary re-fires Enter indefinitely.

Requesting background location and requesting the geofence sync are two separate steps (`requestBackgroundLocationPermission` in `src/services/location.ts` vs `syncGeofences`); granting permission doesn't automatically arm the geofences.

**Location access** goes through `LocationProvider` (`src/context/LocationProvider.tsx`), exposed via `useLocation()`. It does **not** request foreground permission itself — `startWatching()` only starts `watchPositionAsync` if permission is already granted, and the onboarding flow is what actually triggers the permission prompt (via `requestForegroundLocationPermission`) before calling `startWatching()`. This is intentional: permission is meant to be earned by an explicit user action, not requested on app launch.

**Onboarding flow** (`app/onboarding.tsx`) is a single screen with local step state (`intro → stand → form → pinned → armed`), not separate routes. It reuses the live `MapView` and the same `PlaceFormFields` component the edit modal uses, so the save sheet looks identical on day one and day thirty. Completion is tracked via `hasCompletedOnboarding`/`markOnboardingCompleted` in `src/services/onboarding.ts` (AsyncStorage flag), read through `useOnboardingStatus()`.

**Form UI is split for reuse:** `src/components/places/PlaceFormFields.tsx` is the shared field set (suggestion chips, name/note inputs, radius slider); `PlaceFormModal.tsx` wraps it in the actual `<Modal>` shell for the save/edit flow from the home screen and place detail screen; `onboarding.tsx` embeds `PlaceFormFields` directly inside its own bottom sheet.

**Styling:** plain `StyleSheet.create` per component (no nativewind/tailwind, no styled-components). `src/theme/index.ts` is the single source of design tokens (colors, radius, spacing, typography, shadow) — always pull from `theme`, never hardcode colors/sizes in a component. There's no dark mode (`userInterfaceStyle` is pinned to `"light"` in app.json because the palette is light-only).

Two rules the "Citrus" design depends on:

- **Never use `fontWeight`.** The app is set in Nunito, and React Native cannot pick a weight *within* a custom font family — each weight is its own family. Every text style uses `fontFamily` from `theme.fonts` (or a `theme.typography` token, which already carries it). Setting both makes iOS synthesise weight on top of an already-heavy face. Rendering is gated on the font being loaded in `app/_layout.tsx`, so there is never a frame without it.
- **`theme.colors.primary` (`#FF9500`) is a fill colour only** — buttons, borders, dots, map circles. Orange *text or icons* use `theme.colors.primaryStrong` (`#B05A00`); `primary` only reaches 2.0:1 against the cream background, far below WCAG AA. `textMuted` is deliberately equal to `textSecondary` for the same reason — hierarchy comes from size and weight, not from a lighter colour.

`src/components/ui/Toggle.tsx` exists because RN's `Switch` cannot take a border, and a borderless control would be the only element in the app without the dark outline.

**Icons and splash** are generated, not hand-drawn: `node scripts/generate-icons.mjs` rasterises the pin SVG (defined in the script) into `assets/images/` via `sharp`. The iOS icon is deliberately full-bleed orange with no dark frame — iOS masks with a superellipse and would clip a border unevenly at the corners.

**Proximity/status logic:** `src/services/distance.ts` (Haversine) + `src/services/proximity.ts` (distance → `{label, color}` status) feed `src/hooks/useNearbyPlaces.ts`, which both the home screen's "nearby" section and the map screen consume independently — pass the result down as a prop rather than calling the hook twice in the same tree (it re-derives from `usePlaces` + `useLocation` each time).

**Language:** all user-facing UI strings are English, including `Alert` copy, notification text, and `app.json` permission descriptions. Code identifiers and comments are English too. The app was Danish (da-DK) until 2026-08-04 and was translated wholesale; there is no i18n layer — strings are inline literals, and a second locale would mean introducing one from scratch. `dayjs` uses its default English locale (the `dayjs/locale/da` imports are gone) — don't re-add a locale import without also handling it in both `PlaceCard` and `app/places/[id].tsx`, which configure `dayjs` independently.

**Notifications:** `src/services/notifications.ts` configures the foreground notification handler and exposes `sendNotification`/`requestNotificationPermissions`/`hasNotificationPermission`; the geofencing background task calls `sendNotification` directly when a region-enter event fires, passing `{ placeId }` as the data payload so `useNotificationDeepLink` can route the tap.

**Persistence is defensive by contract.** Every AsyncStorage read in `src/services/` is wrapped in try/catch and validates the parsed shape (`Array.isArray`) before returning — a corrupt blob degrades to an empty list rather than throwing into a `useFocusEffect` where nothing catches it. Keep new reads to that pattern. There is still no schema version or migration path; `Place.createdAt` is guarded at both call sites because records predate the field.

**Logging:** use `log()` from `src/util/logger.ts`, never bare `console.log` — it is `__DEV__`-gated so release builds stay quiet, and it is the single seam for wiring up crash reporting later.
