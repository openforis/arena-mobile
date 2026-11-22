#!/usr/bin/env bash
set -euo pipefail

ensure_adb_device_ready() {
  local serial="emulator-5554"
  local max_retries=10

  for _ in $(seq 1 "$max_retries"); do
    local adb_state
    adb_state="$(adb -s "$serial" get-state 2>/dev/null || true)"
    if [[ "$adb_state" = "device" ]]; then
      return 0
    fi

    echo "ADB state is '$adb_state' (expected 'device'). Recovering connection..."
    adb reconnect offline || true
    adb -s "$serial" wait-for-device || true
    sleep 2
  done

  echo "Emulator ADB never stabilized"
  adb devices -l || true
  return 1
}

# 1. Ensure the ADB connection is bridged for the emulator
ensure_adb_device_ready
adb reverse tcp:8081 tcp:8081

wait_for_boot() {
  echo "Waiting for emulator to boot completely..."
  adb wait-for-device
  adb shell 'while [[ "$(getprop sys.boot_completed | tr -d "\r")" != "1" ]]; do sleep 2; done'
  adb shell 'while [[ "$(getprop init.svc.bootanim | tr -d "\r")" != "stopped" ]]; do sleep 2; done'
}

wait_for_boot

echo "Dismissing keyguard and opening Home once so the launcher can settle..."
adb shell wm dismiss-keyguard || true
adb shell input keyevent KEYCODE_HOME || true

echo "Suppressing ANR dialogs (e.g. 'Pixel launcher isn't responding')..."
adb shell settings put global anr_show_background 0
adb shell settings put global hide_error_dialogs 1
adb shell settings put global show_first_crash_dialog 0 || true
adb shell settings put global show_restart_in_crash_dialog 0 || true

echo "Waiting for system services to stabilize..."
sleep 15

APP_ID=org.openforis.arena_mobile
MAESTRO_TESTS_DIR="$HOME/.maestro/tests"
MAX_DEVICE_OFFLINE_RETRIES=2
# the Maestro driver starts slowly on a loaded CI emulator (default timeout: 15 s)
export MAESTRO_DRIVER_STARTUP_TIMEOUT=180000

install_app() {
  echo "Installing APK..."
  # Use -r to replace if exists, -t for test packages (Expo debug builds need this)
  ensure_adb_device_ready
  adb install -r -t -g "${APK_PATH:-android/app/build/outputs/apk/debug/app-debug.apk}"
}

# files picked by the tests with the system file picker (Maestro addMedia supports only photos and videos)
push_test_files() {
  echo "Copying the test files to the Download folder..."
  adb push e2e/maestro/assets/geotiff-test-map.tif /sdcard/Download/geotiff-test-map.tif
  # index the file so that the file picker lists it
  adb shell content call --method scan_volume --uri content://media --arg external_primary || true
}

run_maestro() {
  echo "Running Maestro..."
  # Give the OS a short window after installation to settle
  sleep 10
  ensure_adb_device_ready

  maestro test e2e/maestro/allTests.yaml --format junit --output report.xml \
    -e APP_ID="$APP_ID" \
    -e DEV_BUNDLE="${DEV_BUNDLE:-true}" \
    -e ARENA_SERVER_URL="${ARENA_SERVER_URL}" \
    -e ARENA_SERVER_USERNAME="${ARENA_SERVER_USERNAME}" \
    -e ARENA_SERVER_PASSWORD="${ARENA_SERVER_PASSWORD}"
}

# the emulator adb connection can drop during a run (Maestro: "device offline"); a test failure doesn't match this
last_run_lost_device() {
  local last_run_dir
  last_run_dir="$(ls -1dt "$MAESTRO_TESTS_DIR"/*/ 2>/dev/null | head -n 1)"
  [[ -n "$last_run_dir" ]] &&
    grep -rqE "device offline|DeviceServerDiedException" "$last_run_dir" --include=maestro.log
}

# a dropped adb connection doesn't recover by itself within seconds: restart the adb server and let the emulator settle
recover_device() {
  echo "Restarting the adb server..."
  adb kill-server || true
  adb start-server
  ensure_adb_device_ready
  wait_for_boot
  adb reverse tcp:8081 tcp:8081 || true
  echo "Waiting for system services to stabilize..."
  sleep 30
}

# the failure screenshots are only in the run artifacts: print what the screen shows and the JS errors in the job log
print_screen_content() {
  if adb shell uiautomator dump /sdcard/window_dump.xml >/dev/null 2>&1; then
    adb shell cat /sdcard/window_dump.xml |
      grep -oE '(text|content-desc|resource-id|bounds)="[^"]+"' | grep -vE '="(android|com\.android)[^"]*"' | head -n 400 || true
  fi
}

print_failure_diagnostics() {
  echo "::group::Screen content after the failure (text / content-desc / resource-id / bounds)"
  print_screen_content
  echo "::endgroup::"
  echo "::group::Screen content after one swipe up with adb"
  adb shell input swipe 160 480 160 160 600 || true
  sleep 2
  print_screen_content
  echo "::endgroup::"
  echo "::group::React Native JS errors and crashes (logcat)"
  adb logcat -d -v brief ReactNativeJS:W ReactNative:E AndroidRuntime:E '*:S' | tail -n 80 || true
  echo "::endgroup::"
}

install_app
push_test_files

for attempt in $(seq 0 "$MAX_DEVICE_OFFLINE_RETRIES"); do
  if [[ "$attempt" -gt 0 ]]; then
    echo "The emulator went offline during the run: retry $attempt of $MAX_DEVICE_OFFLINE_RETRIES on a clean install..."
    recover_device
    adb uninstall "$APP_ID" || true
    install_app
    push_test_files
  fi
  if run_maestro; then
    exit 0
  fi
  if ! last_run_lost_device; then
    print_failure_diagnostics
    exit 1
  fi
done

echo "The emulator kept going offline: giving up after $MAX_DEVICE_OFFLINE_RETRIES retries"
exit 1
