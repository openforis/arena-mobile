# E2E tests (Maestro)

This project uses [Maestro](https://maestro.mobile.dev/) for end-to-end tests.

## Prerequisites

- Android Studio emulator or iOS Simulator running
- App installed on emulator/simulator (`npx expo run:android --variant debug` or `npx expo run:ios`)
- Maestro CLI installed:

```bash
curl -fsSL "https://get.maestro.mobile.dev" | bash
maestro --version
```

## Run tests

```bash
# Android
yarn e2e:maestro:android

# iOS
yarn e2e:maestro:ios
```

## Current suite

- `e2e/maestro/smoke.yaml`: basic app-launch smoke test
- `e2e/maestro/smoke.ios.yaml`: basic app-launch smoke test for iOS

## Notes

- Maestro runs against an already installed app build.
- `yarn android` starts Expo Go and is not suitable for launching `org.openforis.arena_mobile` in Maestro.
- iOS E2E requires macOS (iOS Simulator is not available on Linux).

## Troubleshooting Android

If you still get `Unable to launch app org.openforis.arena_mobile`:

```bash
adb devices
adb shell pm list packages | grep org.openforis
```

If no package is listed, run:

```bash
npx expo run:android --variant debug
```
