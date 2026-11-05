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
if [ -z "$SOFFICE" ]; then
  for candidate in /opt/libreoffice*/program/soffice /Applications/LibreOffice.app/Contents/MacOS/soffice; do
    [ -x "$candidate" ] && SOFFICE="$candidate"
  done
fi
if [ ! -x "$SOFFICE" ]; then
  echo "LibreOffice not found: install it or set the SOFFICE variable to the soffice executable" >&2
  exit 1
fi

# official LibreOffice builds bundle a Python with the uno module; distro builds need python3-uno
LO_PROGRAM_DIR="$(dirname "$(readlink -f "$SOFFICE")")"
PYTHON=python3
for candidate in "$LO_PROGRAM_DIR/python" "$LO_PROGRAM_DIR/../Resources/python"; do
  [ -x "$candidate" ] && PYTHON="$candidate" && break
done

VERSION="$(node -p "require('$MANUAL_DIR/../../package.json').version")"
DATE="$(node -p "new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })")"

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

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
"$PYTHON" scripts/export.py "$SOFFICE" "$TMP_DIR/$NAME.docx" "$NAME.docx" "$NAME.pdf"

echo "Done: $MANUAL_DIR/$NAME.docx, $MANUAL_DIR/$NAME.pdf"
