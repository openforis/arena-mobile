# E2E tests (Maestro)

This project uses [Maestro](https://maestro.mobile.dev/) for end-to-end tests.

## Prerequisites

- Android Studio emulator or iOS Simulator running
- App installed on emulator/simulator (`yarn android` or `yarn ios`)
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

# Generic (set APP_ID yourself)
APP_ID=<your.app.id> yarn e2e:maestro
```

## Current suite

- `e2e/maestro/smoke.yaml`: basic app-launch smoke test

## Notes

- Maestro runs against an already installed app build.
- For Expo managed workflow, use `yarn android` / `yarn ios` first.
