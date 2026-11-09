#!/usr/bin/env bash
# Takes the user manual screenshots (docs/user-manual/screenshots/<lang>) on a running Android emulator,
# running the flows in e2e/maestro/manual-screenshots once for every app language.
# A failing flow does not stop the others: the screenshots taken until the failure replace the previous ones
# (the others are kept),
# and the screen at the failure is saved in docs/user-manual/screenshots/_debug.
# Usage: take-manual-screenshots-android.sh <apk> [languages (default: en fr es)]
set -uo pipefail

APK="$1"
LANGS="${2:-en fr es}"
ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
FLOWS_DIR="$ROOT_DIR/e2e/maestro/manual-screenshots"
OUT_ROOT="$ROOT_DIR/docs/user-manual/screenshots"
DEBUG_DIR="$OUT_ROOT/_debug"
APP_ID=org.openforis.arena_mobile

declare -A LANG_LABELS=([en]=English [fr]=French [es]=Spanish)

adb wait-for-device
adb shell 'while [[ "$(getprop sys.boot_completed | tr -d "\r")" != "1" ]]; do sleep 2; done'
rm -rf "$DEBUG_DIR"
mkdir -p "$DEBUG_DIR"

# system dialogs (e.g. "System UI isn't responding") would cover the app (as in run-maestro-android.sh)
adb shell wm dismiss-keyguard || true
adb shell input keyevent KEYCODE_HOME || true
adb shell settings put global anr_show_background 0 || true
adb shell settings put global hide_error_dialogs 1 || true
adb shell settings put global show_first_crash_dialog 0 || true
adb shell settings put global show_restart_in_crash_dialog 0 || true
echo "Waiting for system services to stabilize..."
sleep 30
adb install -r -t -g "$APK"
sleep 5

# fail fast if the screenshots of the app are blank (e.g. emulator image or GPU mode not supported)
adb shell monkey -p "$APP_ID" -c android.intent.category.LAUNCHER 1 > /dev/null
sleep 20
adb exec-out screencap -p > "$DEBUG_DIR/screen-check.png"
adb shell am force-stop "$APP_ID"
check_size="$(stat -c %s "$DEBUG_DIR/screen-check.png")"
echo "Screen check: $check_size bytes"
if [[ "$check_size" -lt 30000 ]]; then
  echo "::error::Blank screenshot of the app: check the emulator image and GPU mode"
  exit 1
fi

failures=0
failed_flows=()
for lang in $LANGS; do
  out="$OUT_ROOT/$lang"
  # screenshots not taken (failing flows) are kept from the previous runs
  mkdir -p "$out"
  node "$FLOWS_DIR/generateLabels.js" "$lang"
  for flow in "$FLOWS_DIR"/[0-9]*.yaml; do
    echo "=== $lang: $(basename "$flow")"
    test_output="$(mktemp -d)"
    if ! maestro test "$flow" --test-output-dir "$test_output" \
      -e APP_ID="$APP_ID" \
      -e APP_LANG="$lang" -e APP_LANG_LABEL="${LANG_LABELS[$lang]}"; then
      echo "::warning::Flow $(basename "$flow") failed ($lang)"
      failures=$((failures + 1))
      failed_flows+=("$lang/$(basename "$flow")")
      # screen at the failure (screenshot taken by Maestro, not by _shot.yaml)
      # the latest one: taken at the failure
      failure_screenshot="$(find "$test_output" -name "*.png" ! -name "shot-*" -printf '%T@ %p\n' | sort -n | tail -n 1 | cut -d' ' -f2-)"
      if [[ -n "$failure_screenshot" ]]; then
        cp "$failure_screenshot" "$DEBUG_DIR/$lang-$(basename "$flow" .yaml).png"
      fi
    fi
    # screenshots taken by _shot.yaml: shot-<name>.png in the test output folder
    find "$test_output" -name "shot-*.png" -print0 | while IFS= read -r -d '' file; do
      name="$(basename "$file")"
      mv "$file" "$out/${name#shot-}"
    done
    rm -rf "$test_output"
  done
done
echo "Failed flows: $failures ${failed_flows[*]}"
count="$(find "$OUT_ROOT" -name "*.png" ! -path "$DEBUG_DIR/*" | wc -l)"
echo "Screenshots: $count"
if [[ "$count" -eq 0 ]]; then
  echo "::error::No screenshots taken"
  exit 1
fi
