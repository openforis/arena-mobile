"""Extracts the text of a .docx as segments (one per paragraph) and writes it back, keeping the formatting.

Used to translate the manual: the text of every paragraph is extracted with inline tags,
the translated text replaces it in a copy of the document.

- <sN>text</sN>: text with the same formatting (e.g. bold UI labels, hyperlinks): keep the tags around
  the translation of the text;
- <xN/>: images, fields, footnote references, etc.: keep them.

Usage:
    python segments.py extract <input.docx> <segments.json>
    python segments.py apply <input.docx> <translated segments.json> <output.docx> [<lang>]
    python segments.py translate <input.docx> <translations.json> <output.docx> [<lang>]
    python segments.py update <input.docx> <translations.json>

- apply: the translated segments file has the same ids as the extracted one, with the translated "text";
- translate: the translations file is a list of {"source", "target"}, where source is the text of the segment
  in the input document: segments without a translation keep the original text;
- update: adds the segments of the input document without a translation to the translations file
  (with an empty target) and removes the translations no longer used.
"""

import json
import os
import re
import sys
import tempfile
import zipfile
from copy import deepcopy

from lxml import etree

W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
W = "{%s}" % W_NS
XML_SPACE = "{http://www.w3.org/XML/1998/namespace}space"

PARTS_PATTERN = re.compile(r"^word/(document|footnotes|endnotes|header\d*|footer\d*)\.xml$")
# run children that are only text (or ignorable)
TEXT_RUN_CHILDREN = {W + "rPr", W + "t", W + "tab", W + "br", W + "lastRenderedPageBreak", W + "softHyphen"}
# paragraphs of the table of contents are regenerated when generating the PDF
SKIPPED_STYLES = re.compile(r"^(TOC|Contents)\d", re.IGNORECASE)
# run properties that don't change the appearance
IGNORED_RPR = {W + "lang", W + "noProof", W + "webHidden"}

TOKEN_PATTERN = re.compile(r"<(/?)([sx])(\d+)(/?)>")


def is_text_run(run):
    return all(child.tag in TEXT_RUN_CHILDREN for child in run)


def run_text(run):
    parts = []
    for child in run:
        if child.tag == W + "t":
            parts.append(child.text or "")
        elif child.tag == W + "tab":
            parts.append("\t")
        elif child.tag == W + "br":
            parts.append("\n")
    return "".join(parts)


def rpr_key(run):
    rpr = run.find(W + "rPr")
    if rpr is None:
        return ""
    rpr = deepcopy(rpr)
    for child in list(rpr):
        if child.tag in IGNORED_RPR:
            rpr.remove(child)
    return etree.tostring(rpr, method="c14n").decode()


def own_runs(paragraph):
    """Runs of the paragraph (also inside hyperlinks, smart tags...), not of nested paragraphs (text boxes)."""
    result = []
    for run in paragraph.iter(W + "r"):
        ancestor = run.getparent()
        while ancestor is not None and ancestor.tag != W + "p":
            ancestor = ancestor.getparent()
        if ancestor is paragraph:
            result.append(run)
    return result


def paragraph_items(paragraph):
    """Groups the runs into items: ("s", [runs]) text spans with the same formatting, ("x", run) other runs."""
    items = []
    for run in own_runs(paragraph):
        if is_text_run(run):
            if not run_text(run):
                continue
            last = items[-1] if items else None
            if (
                last
                and last[0] == "s"
                and last[1][-1].getparent() is run.getparent()
                and rpr_key(last[1][-1]) == rpr_key(run)
            ):
                last[1].append(run)
            else:
                items.append(("s", [run]))
        else:
            items.append(("x", run))
    return items


def paragraph_style(paragraph):
    style = paragraph.find(W + "pPr/" + W + "pStyle")
    return style.get(W + "val") if style is not None else ""


def translatable_paragraphs(root):
    for paragraph in root.iter(W + "p"):
        if SKIPPED_STYLES.match(paragraph_style(paragraph)):
            continue
        items = paragraph_items(paragraph)
        text = "".join(run_text(r) for kind, runs in items if kind == "s" for r in runs)
        if not text.strip():
            continue
        yield paragraph, items


def items_to_text(items):
    parts = []
    for index, (kind, value) in enumerate(items, start=1):
        if kind == "s":
            parts.append(f"<s{index}>" + "".join(run_text(r) for r in value) + f"</s{index}>")
        else:
            parts.append(f"<x{index}/>")
    return "".join(parts)


def parse_tagged(text):
    """Returns the list of (kind, index, text) in the order of the translated text."""
    result = []
    open_span = None
    position = 0
    pending_text = ""

    def add_text(value):
        nonlocal pending_text
        if open_span is not None:
            open_span[2] += value
        elif result and result[-1][0] == "s":
            result[-1][2] += value  # text outside the tags: added to the previous span
        else:
            pending_text += value

    for match in TOKEN_PATTERN.finditer(text):
        add_text(text[position : match.start()])
        position = match.end()
        closing, kind, index, self_closing = match.groups()
        index = int(index)
        if kind == "x":
            result.append(["x", index, ""])
        elif closing:
            open_span = None
        else:
            open_span = ["s", index, pending_text]
            pending_text = ""
            result.append(open_span)
    add_text(text[position:])
    if pending_text and result:
        first_span = next((item for item in result if item[0] == "s"), None)
        if first_span:
            first_span[2] = pending_text + first_span[2]
    return result


def set_run_text(run, text):
    for child in list(run):
        if child.tag != W + "rPr":
            run.remove(child)
    for index, line in enumerate(text.split("\n")):
        if index > 0:
            etree.SubElement(run, W + "br")
        for tab_index, chunk in enumerate(line.split("\t")):
            if tab_index > 0:
                etree.SubElement(run, W + "tab")
            if chunk:
                t = etree.SubElement(run, W + "t")
                t.text = chunk
                t.set(XML_SPACE, "preserve")


def apply_text(paragraph, items, translated):
    parsed = [item for item in parse_tagged(translated) if 1 <= item[1] <= len(items)]
    elements = [value[0] if kind == "s" else value for kind, value in items]
    for kind, value in items:
        if kind == "s":
            for run in value[1:]:
                run.getparent().remove(run)
    parents = {element.getparent() for element in elements}
    if len(parents) == 1:
        # rebuild the runs in the order of the translation (tags can be moved or repeated)
        parent = parents.pop()
        position = min(parent.index(element) for element in elements)
        used = set()
        sequence = []
        for kind, index, text in parsed:
            element = elements[index - 1]
            if kind == "x":
                if index in used:
                    continue
            elif index in used:
                element = deepcopy(element)
            used.add(index)
            if kind == "s":
                set_run_text(element, text)
            sequence.append(element)
        # images and fields missing in the translation are kept
        sequence += [e for i, e in enumerate(elements, start=1) if i not in used and items[i - 1][0] == "x"]
        for element in elements:
            parent.remove(element)
        for offset, element in enumerate(sequence):
            parent.insert(position + offset, element)
    else:
        # runs inside hyperlinks: same order as the original
        span_texts = {}
        for kind, index, text in parsed:
            if kind == "s":
                span_texts[index] = span_texts.get(index, "") + text
        for index, (kind, value) in enumerate(items, start=1):
            if kind == "s":
                set_run_text(value[0], span_texts.get(index, ""))


def set_language(root, lang):
    for lang_element in root.iter(W + "lang"):
        if lang_element.get(W + "val"):
            lang_element.set(W + "val", lang)


def extract(input_docx, output_json):
    segments = []
    with zipfile.ZipFile(input_docx) as archive:
        for name in archive.namelist():
            if not PARTS_PATTERN.match(name):
                continue
            root = etree.fromstring(archive.read(name))
            for number, (_paragraph, items) in enumerate(translatable_paragraphs(root)):
                segments.append({"id": f"{name}#{number}", "text": items_to_text(items)})
    with open(output_json, "w", encoding="utf-8") as file:
        json.dump(segments, file, ensure_ascii=False, indent=1)
    print(f"{len(segments)} segments written to {output_json}")


def apply(input_docx, input_json, output_docx, lang=None):
    with open(input_json, encoding="utf-8") as file:
        translations = {segment["id"]: segment["text"] for segment in json.load(file)}
    applied = 0
    with zipfile.ZipFile(input_docx) as source, zipfile.ZipFile(output_docx, "w", zipfile.ZIP_DEFLATED) as target:
        for info in source.infolist():
            data = source.read(info.filename)
            if PARTS_PATTERN.match(info.filename) or (lang and info.filename == "word/styles.xml"):
                root = etree.fromstring(data)
                if PARTS_PATTERN.match(info.filename):
                    for number, (paragraph, items) in enumerate(list(translatable_paragraphs(root))):
                        translated = translations.get(f"{info.filename}#{number}")
                        if translated is not None:
                            apply_text(paragraph, items, translated)
                            applied += 1
                if lang:
                    set_language(root, lang)
                data = etree.tostring(root, xml_declaration=True, encoding="UTF-8", standalone=True)
            target.writestr(info, data)
    print(f"{applied} segments applied, written to {output_docx}")


def load_translations(translations_json):
    with open(translations_json, encoding="utf-8") as file:
        return json.load(file)


def extract_segments(input_docx):
    tmp_json = os.path.join(tempfile.mkdtemp(), "segments.json")
    extract(input_docx, tmp_json)
    with open(tmp_json, encoding="utf-8") as file:
        segments = json.load(file)
    os.remove(tmp_json)
    return segments


def translate(input_docx, translations_json, output_docx, lang=None):
    targets = {t["source"]: t["target"] for t in load_translations(translations_json) if t.get("target")}
    segments = extract_segments(input_docx)
    missing = [segment for segment in segments if segment["text"] not in targets]
    translated = [{"id": s["id"], "text": targets[s["text"]]} for s in segments if s["text"] in targets]
    tmp_json = output_docx + ".segments.json"
    with open(tmp_json, "w", encoding="utf-8") as file:
        json.dump(translated, file, ensure_ascii=False)
    apply(input_docx, tmp_json, output_docx, lang)
    os.remove(tmp_json)
    for segment in missing:
        print(f"Warning: not translated: {segment['text'][:100]}", file=sys.stderr)
    print(f"{len(missing)} segments not translated (run 'update' to add them to {translations_json})")


def update(input_docx, translations_json):
    existing = {t["source"]: t["target"] for t in load_translations(translations_json)}
    segments = extract_segments(input_docx)
    sources = list(dict.fromkeys(segment["text"] for segment in segments))
    updated = [{"source": source, "target": existing.get(source, "")} for source in sources]
    with open(translations_json, "w", encoding="utf-8") as file:
        json.dump(updated, file, ensure_ascii=False, indent=1)
        file.write("\n")
    added = sum(1 for source in sources if source not in existing)
    removed = sum(1 for source in existing if source not in set(sources))
    print(f"{translations_json}: {added} segments to translate added, {removed} unused removed")


if __name__ == "__main__":
    command, *args = sys.argv[1:]
    if command == "extract":
        extract(*args)
    elif command == "apply":
        apply(*args)
    elif command == "translate":
        translate(*args)
    elif command == "update":
        update(*args)
    else:
        sys.exit(__doc__)
