#!/usr/bin/env bash
# Generates arena-mobile-user-manual.docx (pandoc) and arena-mobile-user-manual.pdf (LibreOffice)
# from arena-mobile-user-manual.md. Requires pandoc, LibreOffice and node.
set -euo pipefail

MANUAL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
NAME=arena-mobile-user-manual

if ! command -v pandoc >/dev/null; then
  echo "pandoc not found: install it (https://pandoc.org/installing.html)" >&2
  exit 1
fi

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

VERSION="$(node -p "require('$MANUAL_DIR/../../package.json').version")"
DATE="$(node -p "new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })")"

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

echo "Generating $NAME.docx (version $VERSION, $DATE)..."
pandoc "$NAME.md" \
  --from markdown \
  --to docx \
  --reference-doc reference.docx \
  --number-sections \
  --lua-filter scripts/filter.lua \
  --metadata version="$VERSION" \
  --metadata releaseDate="$DATE" \
  --metadata lang=en-GB \
  --output "$TMP_DIR/$NAME.docx"

echo "Updating the table of contents and exporting $NAME.pdf..."
# separate profile: works also when another LibreOffice instance is running
PIPE_NAME="arena_mobile_manual_$$"
"$SOFFICE" --headless --invisible --norestore \
  "-env:UserInstallation=file://$TMP_DIR/profile" \
  "--accept=pipe,name=$PIPE_NAME;urp;" &
SOFFICE_PID=$!
"$PYTHON" scripts/export.py "$PIPE_NAME" "$TMP_DIR/$NAME.docx" "$NAME.docx" "$NAME.pdf"
wait "$SOFFICE_PID" || true
SOFFICE_PID=""

echo "Done: $MANUAL_DIR/$NAME.docx, $MANUAL_DIR/$NAME.pdf"
