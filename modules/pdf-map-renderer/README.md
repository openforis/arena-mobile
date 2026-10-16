# pdf-map-renderer

Local Expo module (autolinked from `modules/`) that renders georeferenced PDF
pages into XYZ map tiles. Used by `src/service/pdfMaps` (JS interface:
`src/service/pdfMaps/PdfMapRenderer.ts`); see `docs/geospatial-pdf-maps-plan.md`.

- Android: `android.graphics.pdf.PdfRenderer`
- iOS: CoreGraphics (`CGPDFDocument`)

The matrices passed to `renderTiles` map the page *display space* (points,
origin top-left, y down, crop box and `/Rotate` applied, as in pdfium /
Android `PdfRenderer`) to the pixels of the rendered block.

Native code changes require a new native build (`yarn prebuild:android`,
`eas build`); the module is not available in Expo Go.
