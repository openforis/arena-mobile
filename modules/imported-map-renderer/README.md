# imported-map-renderer

Local Expo module (autolinked from `modules/`) that renders imported maps
(georeferenced PDF pages, GeoTIFF images) into XYZ map tiles. Used by
`src/service/importedMaps` (JS interface:
`src/service/importedMaps/ImportedMapRenderer.ts`); see
`docs/plans/geospatial-pdf-maps-plan.md` and `docs/plans/geotiff-maps-plan.md`.

- `renderTiles` (PDF): Android `android.graphics.pdf.PdfRenderer`, iOS
  CoreGraphics (`CGPDFDocument`). The matrix maps the page *display space*
  (points, origin top-left, y down, crop box and `/Rotate` applied, as in
  pdfium / Android `PdfRenderer`) to the pixels of the rendered block.
- `renderImageTiles` (GeoTIFF): RGBA pixels decoded in JS (not
  premultiplied) drawn with a matrix from the image pixels to the pixels of
  the rendered block (Android `Canvas`, iOS CoreGraphics).
- `buildOverviewTiles`: lower zoom levels by downsampling.

Native code changes require a new native build (`yarn prebuild:android`,
`eas build`); the module is not available in Expo Go.
