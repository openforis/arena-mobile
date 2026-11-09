"""Replaces images of a .docx with screenshots, as listed in a mapping file.

Usage:
    python screenshots.py <input.docx> <screenshots.json> <screenshots folder> <output.docx>

screenshots.json: list of
    {"media": "image27.jpeg", "screenshot": "record-form", "crop": [left, top, right, bottom]}
- media: name of the image in word/media of the .docx;
- screenshot: name of the screenshot (without extension) in the screenshots folder
  (taken by the "User manual screenshots" workflow, see e2e/maestro/manual-screenshots);
- crop (optional): part of the screenshot to keep, as fractions of its width and height
  (the status and navigation bars are always removed).

The image keeps its width in the document, its height follows the new proportions,
limited to MAX_HEIGHT (the width is reduced if needed). Missing screenshots are skipped.
"""

import io
import json
import os
import sys
import tempfile
import zipfile
from pathlib import Path

from lxml import etree
from PIL import Image

NS = {
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    "wp": "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing",
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "pic": "http://schemas.openxmlformats.org/drawingml/2006/picture",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "rel": "http://schemas.openxmlformats.org/package/2006/relationships",
}
EMU_PER_INCH = 914400
MAX_HEIGHT = int(4.2 * EMU_PER_INCH)
# Android status bar and navigation (gesture) bar heights, as fraction of the screen height (Pixel 6: 2400 px)
STATUS_BAR_HEIGHT = 0.05
NAVIGATION_BAR_HEIGHT = 0.025
SCREENSHOT_EXTENSIONS = (".jpg", ".jpeg", ".png")
MANUAL_DIR = Path(__file__).resolve().parent.parent


def safe_path(value):
    """Resolves a path given on the command line: it must be in the manual folder or in the temp folder."""
    path = Path(value).resolve()
    if not any(path.is_relative_to(root) for root in (MANUAL_DIR, Path(tempfile.gettempdir()).resolve())):
        raise SystemExit(f"{value}: use a path in {MANUAL_DIR} or in {tempfile.gettempdir()}")
    return path


def safe_name(value):
    """A file name (screenshot or image of the document), without folders."""
    if not value or os.path.basename(value) != value or value in (".", ".."):
        raise SystemExit(f"{value}: invalid file name")
    return value


def find_screenshot(folder, name):
    for extension in SCREENSHOT_EXTENSIONS:
        path = os.path.join(folder, name + extension)
        if os.path.exists(path):
            return path
    return None


def prepare_image(path, crop, media_name):
    image = Image.open(path).convert("RGB")
    width, height = image.size
    left, top, right, bottom = crop or [0, 0, 1, 1]
    top = max(top, STATUS_BAR_HEIGHT)
    bottom = min(bottom, 1 - NAVIGATION_BAR_HEIGHT)
    image = image.crop((round(left * width), round(top * height), round(right * width), round(bottom * height)))
    output = io.BytesIO()
    if media_name.lower().endswith(".png"):
        image.save(output, "PNG", optimize=True)
    else:
        image.save(output, "JPEG", quality=85, optimize=True)
    return output.getvalue(), image.size


def media_rel_ids(rels_xml):
    """media name -> relationship ids"""
    result = {}
    for rel in etree.fromstring(rels_xml).findall("rel:Relationship", NS):
        target = rel.get("Target")
        if target.startswith("media/"):
            result.setdefault(target[len("media/") :], []).append(rel.get("Id"))
    return result


def resize_drawings(document_root, rel_ids, size):
    image_width, image_height = size
    for blip in document_root.iter("{%s}blip" % NS["a"]):
        if blip.get("{%s}embed" % NS["r"]) not in rel_ids:
            continue
        drawing = next(a for a in blip.iterancestors() if a.tag in ("{%s}inline" % NS["wp"], "{%s}anchor" % NS["wp"]))
        extent = drawing.find("wp:extent", NS)
        cx = int(extent.get("cx"))
        cy = round(cx * image_height / image_width)
        if cy > MAX_HEIGHT:
            cx = round(cx * MAX_HEIGHT / cy)
            cy = MAX_HEIGHT
        extent.set("cx", str(cx))
        extent.set("cy", str(cy))
        pic = next(a for a in blip.iterancestors() if a.tag == "{%s}pic" % NS["pic"])
        ext = pic.find("pic:spPr/a:xfrm/a:ext", NS)
        if ext is not None:
            ext.set("cx", str(cx))
            ext.set("cy", str(cy))


def main(input_docx, mapping_json, screenshots_folder, output_docx):
    input_docx, mapping_json, screenshots_folder, output_docx = (
        safe_path(value) for value in (input_docx, mapping_json, screenshots_folder, output_docx)
    )
    with open(mapping_json, encoding="utf-8") as file:
        mapping = json.load(file)
    with zipfile.ZipFile(input_docx) as source:
        rel_ids = media_rel_ids(source.read("word/_rels/document.xml.rels"))
        document_root = etree.fromstring(source.read("word/document.xml"))
        replaced = {}
        for item in mapping:
            media = safe_name(item["media"])
            path = find_screenshot(screenshots_folder, safe_name(item["screenshot"]))
            if not path:
                print(f"Warning: screenshot {item['screenshot']} not found in {screenshots_folder}", file=sys.stderr)
                continue
            data, size = prepare_image(path, item.get("crop"), media)
            replaced["word/media/" + media] = data
            resize_drawings(document_root, set(rel_ids.get(media, [])), size)
        # the output can be the input file itself
        tmp_output = output_docx.with_name(output_docx.name + ".tmp")
        with zipfile.ZipFile(tmp_output, "w", zipfile.ZIP_DEFLATED) as target:
            for info in source.infolist():
                if info.filename == "word/document.xml":
                    data = etree.tostring(document_root, xml_declaration=True, encoding="UTF-8", standalone=True)
                else:
                    data = replaced.get(info.filename) or source.read(info.filename)
                target.writestr(info, data)
    os.replace(tmp_output, output_docx)
    print(f"{len(replaced)} images replaced with screenshots from {screenshots_folder}")


if __name__ == "__main__":
    if len(sys.argv) != 5:
        sys.exit(__doc__)
    main(*sys.argv[1:])
