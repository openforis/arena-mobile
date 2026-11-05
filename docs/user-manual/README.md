# Arena Mobile user manual

- `arena-mobile-user-manual.md`: the manual (source, [pandoc Markdown](https://pandoc.org/MANUAL.html#pandocs-markdown)).
- `images/`: screenshots and logos used in the manual.
- `arena-mobile-user-manual.docx`, `arena-mobile-user-manual.pdf`: generated, do not edit them.
- `reference.docx`: styles, page setup, header and footer of the generated document.
- `scripts/`: build scripts.

## Updating the manual

Update the manual in the same pull request as every user-facing change, then regenerate the documents:

```bash
yarn docs:manual
```

It requires [pandoc](https://pandoc.org/installing.html), [LibreOffice](https://www.libreoffice.org/) and node. The version (from `package.json`) and the date on the cover are filled in automatically. Commit the updated `.md`, images, `.docx` and `.pdf`.

If LibreOffice is not found, set the `SOFFICE` variable to the `soffice` executable. With a LibreOffice installed from the Linux distribution packages, `python3-uno` is also needed.

## Writing conventions

- Headings are numbered automatically: don't write numbers in them.
- Link to another section with its heading text, e.g. `[Auto-sync]`.
- Images: `![](images/name.jpg){width=40%}`; the width is relative to the page. Images alone in a paragraph are centered. Small icons inside a sentence: `{height=0.25in}`.
- Name images after their section (e.g. `send-data-2.jpg`). Crop the status bar out of phone screenshots.
- Notes: `> **Note:** ...`.
- UI labels in bold, as they appear in the English version of the app (see `src/localization/en`).

To change fonts, colors or the header/footer, edit the styles in `reference.docx` with Word or LibreOffice (its content is ignored).
