#!/usr/bin/env bash
# Replaces the JS bundle of an Android APK and signs it again with a new debug key.
# Used by the E2E workflow to reuse an APK whose native code and assets didn't change.
# Usage: repack-android-apk.sh <input.apk> <index.android.bundle> <output.apk>
set -euo pipefail

apk_in="$1"
bundle="$2"
apk_out="$3"

build_tools="$ANDROID_HOME/build-tools/$(ls "$ANDROID_HOME/build-tools" | sort -V | tail -1)"
work_dir="$(mktemp -d)"
trap 'rm -rf "$work_dir"' EXIT

cp "$apk_in" "$work_dir/app.apk"
mkdir -p "$work_dir/assets"
cp "$bundle" "$work_dir/assets/index.android.bundle"
# stored (not compressed): the app can map it from the APK instead of inflating it
(cd "$work_dir" && zip -q -0 app.apk assets/index.android.bundle)

"$build_tools/zipalign" -f -p 4 "$work_dir/app.apk" "$apk_out"

keytool -genkeypair -keystore "$work_dir/debug.keystore" -storepass android \
  -keypass android -alias androiddebugkey -keyalg RSA -keysize 2048 \
  -validity 10000 -dname "CN=Android Debug,O=Android,C=US" >/dev/null 2>&1
"$build_tools/apksigner" sign --ks "$work_dir/debug.keystore" \
  --ks-pass pass:android "$apk_out"
