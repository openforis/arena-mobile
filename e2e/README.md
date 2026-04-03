# E2E tests (Maestro)

This project uses [Maestro](https://maestro.mobile.dev/) for end-to-end tests.

## Prerequisites

- Android Studio emulator running
- App installed on emulator (`npx expo run:android --variant debug`)
- Maestro CLI installed:

```bash
curl -fsSL "https://get.maestro.mobile.dev" | bash
maestro --version
```

## Run tests

```bash
# Full Android suite (prepares debug build, then runs all flows)
yarn e2e:maestro:android

# Run Maestro directly (all flows in e2e/maestro)
yarn e2e:maestro
```

## Required environment variables

Set these before running flows:

- `ARENA_SERVER_URL` (for login flow)
- `ARENA_SERVER_USERNAME` (for login flow)
- `ARENA_SERVER_PASSWORD` (for login flow)

Example:

```bash
export ARENA_SERVER_URL=https://www.openforis-arena.org
export ARENA_SERVER_USERNAME="you@example.com"
export ARENA_SERVER_PASSWORD="your-password"

yarn e2e:maestro:android
```

## Current suite

- `e2e/maestro/001.startup.yaml`: app launch smoke test
- `e2e/maestro/002.login.yaml`: login against Arena server
- `e2e/maestro/003.download-demo-survey.yaml`: import demo survey from cloud

## Notes

- Maestro runs against an already installed app build.
- `yarn start` starts Expo Go and is not suitable for launching the native app package in Maestro.
- Current suite is Android-oriented; there is no dedicated iOS Maestro script in `package.json`.
- `APP_ID` is injected by `yarn e2e:maestro:android`.

## Troubleshooting Android

If you still get `Unable to launch app`:

```bash
adb devices
adb shell pm list packages | grep org.openforis
```

If no package is listed, run:

```bash
npx expo run:android --variant debug
```
