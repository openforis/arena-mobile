#!/usr/bin/env bash
# Generates the user manual PDFs from arena-mobile-user-manual.docx with LibreOffice,
# filling in the version and the date:
# arena-mobile-user-manual-<lang>.pdf: English (en) from the .docx, the other languages from the .docx
# translated with translations/<lang>.json and with the screenshots in screenshots/<lang> (see screenshots.json)
# Requires LibreOffice, node and python3 with lxml and Pillow.
# Usage: build.sh [languages (default: en fr es)]
set -euo pipefail

MANUAL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
NAME=arena-mobile-user-manual

SOFFICE="${SOFFICE:-$(command -v soffice || command -v libreoffice || true)}"
if [[ -z "$SOFFICE" ]]; then
  for candidate in /opt/libreoffice*/program/soffice /Applications/LibreOffice.app/Contents/MacOS/soffice; do
    if [[ -x "$candidate" ]]; then
      SOFFICE="$candidate"
    fi
  done
fi
if [[ ! -x "$SOFFICE" ]]; then
  echo "LibreOffice not found: install it or set the SOFFICE variable to the soffice executable" >&2
  exit 1
fi

# official LibreOffice builds bundle a Python with the uno module; distro builds need python3-uno
if [[ -z "${PYTHON:-}" ]]; then
  LO_PROGRAM_DIR="$(dirname "$(readlink -f "$SOFFICE")")"
  PYTHON=python3
  for candidate in "$LO_PROGRAM_DIR/python" "$LO_PROGRAM_DIR/../Resources/python"; do
    if [[ -x "$candidate" ]]; then
      PYTHON="$candidate"
      break
    fi
  done
fi

LANGS="${1:-en fr es}"
SEGMENTS_PYTHON="${SEGMENTS_PYTHON:-python3}"
VERSION="$(node -p "require('$MANUAL_DIR/../../package.json').version")"

TMP_DIR="$(mktemp -d)"
SOFFICE_PID=""
cleanup() {
  if [[ -n "$SOFFICE_PID" ]]; then
    kill "$SOFFICE_PID" 2>/dev/null || true
  fi
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

cd "$MANUAL_DIR"

for lang in $LANGS; do
  output="$NAME-$lang.pdf"
  if [[ "$lang" == "en" ]]; then
    docx="$NAME.docx"
  else
    docx="$TMP_DIR/$NAME-$lang.docx"
    "$SEGMENTS_PYTHON" scripts/segments.py translate "$NAME.docx" "translations/$lang.json" "$TMP_DIR/translated.docx" "$lang"
    "$SEGMENTS_PYTHON" scripts/screenshots.py "$TMP_DIR/translated.docx" screenshots.json "screenshots/$lang" "$docx"
  fi
  locale="$lang"
  if [[ "$lang" == "en" ]]; then
    locale="en-GB"
  fi
  DATE="$(node -p "new Date().toLocaleDateString('$locale', { day: 'numeric', month: 'long', year: 'numeric' })")"

  echo "Exporting $output (version $VERSION, $DATE)..."
  # separate profile: works also when another LibreOffice instance is running
  PIPE_NAME="arena_mobile_manual_$$_$lang"
  "$SOFFICE" --headless --invisible --norestore \
    "-env:UserInstallation=file://$TMP_DIR/profile" \
    "--accept=pipe,name=$PIPE_NAME;urp;" &
  SOFFICE_PID=$!
  "$PYTHON" scripts/export.py "$PIPE_NAME" "$docx" "$output" "$VERSION" "$DATE"
  wait "$SOFFICE_PID" || true
  SOFFICE_PID=""

  echo "Done: $MANUAL_DIR/$output"
done
