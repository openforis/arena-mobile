#!/usr/bin/env bash
# Takes the user manual screenshots (docs/user-manual/screenshots/<lang>) on a running Android emulator,
# running the flows in e2e/maestro/manual-screenshots once for every app language.
# A failing flow does not stop the others: the screenshots taken until the failure are kept.
# Usage: take-manual-screenshots-android.sh <apk> [languages (default: en fr es)]
set -uo pipefail

APK="$1"
LANGS="${2:-en fr es}"
ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
FLOWS_DIR="$ROOT_DIR/e2e/maestro/manual-screenshots"
OUT_ROOT="$ROOT_DIR/docs/user-manual/screenshots"
APP_ID=org.openforis.arena_mobile

declare -A LANG_LABELS=([en]=English [fr]=French [es]=Spanish)

adb wait-for-device
adb shell 'while [[ "$(getprop sys.boot_completed | tr -d "\r")" != "1" ]]; do sleep 2; done'
adb shell wm dismiss-keyguard || true
adb shell settings put global hide_error_dialogs 1 || true
sleep 10
adb install -r -t -g "$APK"
sleep 5

failures=0
failed_flows=()
for lang in $LANGS; do
  out="$OUT_ROOT/$lang"
  rm -rf "$out"
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
count="$(find "$OUT_ROOT" -name "*.png" | wc -l)"
echo "Screenshots: $count"
if [[ "$count" -eq 0 ]]; then
  echo "::error::No screenshots taken"
  exit 1
fi
