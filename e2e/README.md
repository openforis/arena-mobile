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

# Run only the flows using the demo survey bundled with the app (no server credentials needed)
yarn e2e:maestro:demo -e APP_ID=org.openforis.arena_mobile
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
- `e2e/maestro/004.create-new-record.yaml`: create a new record
- `e2e/maestro/005.demo-survey-site-details.yaml`: bundled demo survey – hierarchical codes, GPS coordinate, calculated attributes, multiple attribute, enumerated entity
- `e2e/maestro/006.demo-survey-regeneration.yaml`: bundled demo survey – multiple entity form, taxon, conditional attributes, nested table
- `e2e/maestro/007.demo-survey-media.yaml`: bundled demo survey – file attributes (image picked from the gallery, video, audio, other)

- `e2e/maestro/008.demo-survey-navigate-to-target.yaml`: bundled demo survey – "Navigate to target" compass dialog (coordinate with a `distance()` validation)
- `e2e/maestro/009.demo-survey-clear-not-applicable-values.yaml`: bundled demo survey – value cleared when its attribute becomes not applicable after deleting an entity (relevance with `count()`)

Flows 005-009 start from a clean app state (`launchApp: clearState: true`) and don't need a server login;
`e2e/maestro/demoSurveyTests.yaml` runs only them (plus the startup check).
Shared steps are in `e2e/maestro/common/`; `e2e/maestro/assets/` contains the files added to the device gallery.

## Notes

- Maestro runs against an already installed app build.
- `yarn start` starts Expo Go and is not suitable for launching the native app package in Maestro.
- Current suite is Android-oriented; there is no dedicated iOS Maestro script in `package.json`.
- `APP_ID` is injected by `yarn e2e:maestro:android`.
- In debug builds, React Native LogBox notifications can cover the bottom of the screen: flows close them with `common/dismiss-dev-notifications.yaml`.

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
