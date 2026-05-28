---
name: maestro-e2e
description: Run and debug Maestro e2e tests for arena-mobile on Android. Use when asked to run e2e tests, debug a failing Maestro flow, or set up local Maestro testing.
---

# Maestro E2E Tests — arena-mobile

Maestro tests live in `e2e/maestro/`. The CI pipeline is defined in `.github/workflows/e2e-maestro-android.yml`. Use this guide to run the same tests locally.

## Prerequisites

- **Node 24** + **Yarn Berry** (`corepack enable`)
- **JDK 17** (e.g. `sdk install java 17.0.x-tem`)
- **Android SDK** with build-tools and an API 35 AVD (x86_64, `google_atd` system image recommended)
- **Maestro CLI**: `curl -fsSL "https://get.maestro.mobile.dev" | bash`

Set environment variables for server-connected tests (flows 002-004):
```bash
export ARENA_SERVER_URL=https://your-arena-server
export ARENA_SERVER_USERNAME=your@email.com
export ARENA_SERVER_PASSWORD=yourpassword
```

## Step 1 — Install dependencies

```bash
yarn install --immutable
```

## Step 2 — Build the debug APK

```bash
# Prebuild native project (only needed after package.json / app.json / app.config.ts changes)
npx expo prebuild --platform android

# Bundle JS
mkdir -p android/app/src/main/assets
npx expo export:embed \
  --platform android \
  --dev false \
  --entry-file node_modules/expo/AppEntry.js \
  --bundle-output android/app/src/main/assets/index.android.bundle \
  --assets-dest android/app/src/main/res

# Compile APK
cd android && ./gradlew assembleDebug --no-daemon && cd ..
```

The APK is at `android/app/build/outputs/apk/debug/app-debug.apk`.

## Step 3 — Start the emulator

```bash
# List available AVDs
emulator -list-avds

# Start one (adjust name)
emulator -avd Pixel_8_API_35 -no-snapshot -gpu swiftshader_indirect -no-boot-anim &

# Wait for boot
adb wait-for-device
adb shell 'while [[ "$(getprop sys.boot_completed | tr -d "\r")" != "1" ]]; do sleep 2; done'

# Suppress crash/ANR dialogs
adb shell settings put global anr_show_background 0
adb shell settings put global hide_error_dialogs 1
```

## Step 4 — Install the APK

```bash
adb install -r -t -g android/app/build/outputs/apk/debug/app-debug.apk
sleep 5  # let the OS settle after install
```

## Step 5 — Run the tests

```bash
# Full suite
maestro test e2e/maestro/allTests.yaml \
  --format junit --output report.xml \
  -e APP_ID=org.openforis.arena_mobile \
  -e ARENA_SERVER_URL=$ARENA_SERVER_URL \
  -e ARENA_SERVER_USERNAME=$ARENA_SERVER_USERNAME \
  -e ARENA_SERVER_PASSWORD=$ARENA_SERVER_PASSWORD

# Single flow (no server credentials needed for flow 004 after survey is cached)
maestro test e2e/maestro/004.create-new-record.yaml \
  -e APP_ID=org.openforis.arena_mobile
```

## Test flows

| File | What it tests |
|------|---------------|
| `001.startup.yaml` | App launches, "Not logged in" visible |
| `002.login.yaml` | Login against Arena server |
| `003.download-demo-survey.yaml` | Import `arena_demo` survey from cloud |
| `004.create-new-record.yaml` | Create record, toggle boolean/relevant-if/visible-if fields, confirm-swipe dialog |

## Debugging

- **Screenshots and logs**: `~/.maestro/tests/<timestamp>/`
- **Interactive recorder**: `maestro studio` (opens browser UI to build flows by tapping)
- **Inspect element IDs**: `maestro hierarchy` while the app is in the foreground
- **Re-run from specific step**: comment out earlier steps with `#`

## Key testIDs used in flows

| testID | Component | Notes |
|--------|-----------|-------|
| `confirm-dialog-title` | `Dialog.Title` in `AppConfirmDialog` | Wait for this to confirm dialog is open |
| `confirm-swipe-button` | Wrapper `View` around `SwipeButton` | Not swipeable directly — see below |
| `SwipeThumb` | `Animated.View` inside `rn-swipe-button` | **Use this as swipe target** — it holds the PanResponder |
| `confirm-dialog-confirm-button` | Confirm `Button` | Becomes enabled after swipe completes |

> **Why `SwipeThumb` and not `confirm-swipe-button`?**  
> The PanResponder in `rn-swipe-button` is attached to `SwipeThumb` (the draggable fill element), not the outer container. Maestro's `swipe: from: id:` starts from the element's center. `confirm-swipe-button` is the full-width container so its center is over the title text, missing the thumb entirely. `SwipeThumb` starts as a ~50px square at the left edge, so swiping from its center correctly hits the PanResponder.
