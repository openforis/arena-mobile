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

install_app

for attempt in $(seq 0 "$MAX_DEVICE_OFFLINE_RETRIES"); do
  if [[ "$attempt" -gt 0 ]]; then
    echo "The emulator went offline during the run: retry $attempt of $MAX_DEVICE_OFFLINE_RETRIES on a clean install..."
    recover_device
    adb uninstall "$APP_ID" || true
    install_app
  fi
  if run_maestro; then
    exit 0
  fi
  if ! last_run_lost_device; then
    exit 1
  fi
done

echo "The emulator kept going offline: giving up after $MAX_DEVICE_OFFLINE_RETRIES retries"
exit 1
