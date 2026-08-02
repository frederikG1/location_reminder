# Pin Me

Gem et sted, og få en påmindelse næste gang du er i nærheden.

An Expo / React Native app that turns saved locations into geofenced reminders.
Save a place while you're standing there, give it a note, and iOS wakes the app
with a notification the next time you come within its radius. All data lives on
the device — there is no backend and nothing is uploaded.

The UI is Danish (da-DK); code identifiers and comments are English.

## Requirements

- Node 20+
- Xcode (iOS) / Android Studio (Android)
- A **physical device** for anything involving geofencing — see below

## Getting started

```bash
npm install
```

```bash
npm run start
```

The app uses native modules (`expo-location`, `expo-notifications`,
`react-native-maps`) and a custom dev client, so it does **not** run in Expo Go.
Build it onto a device or simulator first:

```bash
npm run ios
```

If CocoaPods fails with `Encoding::CompatibilityError`, your shell isn't set to a
UTF-8 locale:

```bash
LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 npx expo run:ios
```

## Testing geofencing

**Background location and geofencing do not work in the iOS Simulator or most
Android emulators.** Region-enter events are delivered by the OS to a headless
JS context, which the simulator does not exercise realistically. Verify the core
flow — save a place, leave, come back, get a notification — on real hardware.

## Checks

```bash
npm run typecheck
```

```bash
npm run lint
```

There is no test framework configured.

## Builds

Build profiles live in `eas.json`.

```bash
eas build --platform ios --profile preview
```

`preview` produces an internally-distributed build for registered devices;
`production` produces a store build. `appVersionSource` is `remote`, so EAS owns
the iOS build number — the `buildNumber` field in `app.json` is not used.

## Other scripts

```bash
node scripts/generate-icons.mjs
```

Regenerates the app icon, splash and favicon in `assets/images/` from the pin SVG
defined inside the script.

## Architecture

See [CLAUDE.md](CLAUDE.md) for a detailed tour of the routing, data model,
geofencing paths and design-system rules.
