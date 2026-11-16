# GeoTIFF maps – design note

Import **GeoTIFF** files as offline map overlays, the same way as geospatial
PDFs (see `geospatial-pdf-maps-plan.md`): the file is rendered once on the
device into an XYZ tile pyramid and shown on top of the base map of every map
of the app, fully offline.

## Naming

The feature is no longer PDF-only. The code was renamed from "PDF map" to
**imported map** (first PR, rename only, no behavior change):

| Before | After |
|---|---|
| `model/PdfMap.ts` (`PdfMap`) | `model/ImportedMap.ts` (`ImportedMap`) |
| `service/pdfMaps/*` (`PdfMapsService`, `PdfMapImportJob`, …) | `service/importedMaps/*` (`ImportedMapsService`, `ImportedMapImportJob`, …) |
| `modules/pdf-map-renderer` (native module `PdfMapRenderer`) | `modules/imported-map-renderer` (`ImportedMapRenderer`) |
| `screens/PdfMapImport` (`screenKeys.pdfMapImport`) | `screens/MapImport` (`screenKeys.mapImport`) |
| `screens/PdfMapViewer`, `OfflineMaps/PdfMapsTab`, `MapView/PdfMapsPanel` | `ImportedMapViewer`, `ImportedMapsTab`, `ImportedMapsPanel` |
| i18n namespace `pdfMaps`, key `offlineMaps:tabs.pdfMaps` | `importedMaps`, `offlineMaps:tabs.importedMaps` |
| settings key `pdfMaps` | `importedMaps` |

PDF maps were released in 2.11.3, so:

- settings stored with the `pdfMaps` key are migrated when read
  (`settingsService.ts`, `SettingsStore.fromStored`) and saved with the new key
  at the next update;
- the storage folder keeps its name (`documentDirectory/pdf_maps`): it is not
  visible to the user and renaming it would mean moving big folders at startup;
- the native module name changes: the next builds include it under the new
  name (it needs a new native build anyway, see below).

The PDF-specific code keeps its names: `GeoPdfParser`, `GeoPdfTransform`,
`GeoPdfTilePlanner` (the generic parts of the last two move to
`ImportedMapTransform` / `ImportedMapTilePlanner` in the GeoTIFF PR).
User-facing texts ("PDF maps", "Import PDF") change in the GeoTIFF PR, when
they become wrong.

## What a GeoTIFF contains

A TIFF image plus GeoTIFF tags:

- raster → model space: `ModelTiepointTag` + `ModelPixelScaleTag` (north-up
  image), or `ModelTransformationTag` (4×4 affine: rotated/sheared image);
  several tie points (ground control points) are possible but rare;
- coordinate system: `GeoKeyDirectoryTag` (+ `GeoDoubleParamsTag`,
  `GeoAsciiParamsTag`): `GTModelTypeGeoKey` (projected / geographic),
  `ProjectedCSTypeGeoKey` or `GeographicTypeGeoKey` (EPSG code), or a
  "user-defined" CRS described by projection, datum and parameter keys;
  `GTRasterTypeGeoKey` (pixel is area / point, ½ pixel shift);
- optionally `GDAL_NODATA` (transparent value), internal overviews
  (reduced-resolution images, always present in Cloud Optimized GeoTIFFs),
  internal tiling instead of strips.

Unlike geospatial PDFs (control points in lat/lon), the coordinates are almost
always **projected** (UTM, national grids), so a projection library is needed.

## Approach

Same pipeline as PDF maps; only the "source" changes.

```
pick file → analyze (header only) → georeference (pixel ↔ mercator homography + neatline)
  → preview (low zooms) → import job: render max zoom in blocks → overview tiles → save
```

### Reused unchanged

- tile planning: render blocks of 4×4 tiles at the max zoom, overview tiles
  built by downsampling, tile counts and estimate, `MAX_TILES_PER_MAP`;
- import job (progress, cancel, cleanup), preview in the cache folder, storage,
  `MapView` tile overlays, panel (visibility, opacity, zoom to map), viewer;
- native `buildOverviewTiles` and tile writing (empty tiles skipped, JPEG for
  opaque tiles, PNG otherwise).

### 1. Reading the file: geotiff.js

[geotiff.js](https://github.com/geotiffjs/geotiff.js) (`geotiff` 3.x, pure JS,
MIT; `proj4` already lists it as an optional peer dependency):

- tags, GeoKeys, image size, tiling, overviews (`getImageCount` / `getImage`);
- **windowed decoding with resampling**: `image.readRGB({ window, width,
  height, enableAlpha, interleave: true })` returns RGB(A) for any
  photometric interpretation (RGB, grayscale, palette, YCbCr, CMYK) and
  decodes only the strips/tiles touching the window; with overviews the
  closest lower resolution image is used;
- compressions: none, PackBits, LZW, Deflate, JPEG (all in JS). LERC and
  Zstandard use WebAssembly decoders, not available on Hermes → those files
  are rejected with a message.

**File access**: GeoTIFFs can be hundreds of MB, they must not be read in
memory as a whole (as `GeoPdfParser` does with PDFs). A geotiff.js custom
source reads byte ranges with the `expo-file-system` `FileHandle`
(`offset` + `readBytes`), so only the header, the IFDs and the strips/tiles
needed by a block are read.

Everything runs on the JS thread (no web workers in React Native): the job
awaits between blocks so the UI stays responsive (progress dialog,
cancel). Decoding is slower than native code; to measure in the spike.

### 2. Georeference → homography

`src/utils/GeoTiffParser.ts` (pure JS, unit tested):

1. raster → CRS affine from the tie point + pixel scale or the transformation
   matrix (with the "pixel is point" shift);
2. CRS definition, in this order:
   - GeoKeys → proj4 definition (EPSG code or user-defined parameters) with
     [`geotiff-geokeys-to-proj4`](https://github.com/matafokka/geotiff-geokeys-to-proj4)
     (it includes the EPSG tables needed for the codes; ~1.5 MB unpacked,
     check the bundle size impact in the spike);
   - fallback: the WKT of an SRS with the same EPSG code in the current
     survey (`Surveys.getSRSIndex`, defined in Arena);
   - otherwise: "coordinate system not supported (EPSG:xxxx)";
3. a grid of control points over the image (5×5; denser for extents > ~1°)
   transformed pixel → CRS → WGS84 (`proj4`, which also applies the datum
   shift when the definition has it) → Web Mercator;
4. `GeoPdfTransform.computeHomography` (least squares with more than 4
   points, already supported) gives the pixel → mercator homography; the
   residual of the fit is checked (max error in pixels at the native zoom),
   and the image is split in parts if it is too large (phase 2, only for very
   large extents).

The "display space" of the planner becomes the **image pixel space** (origin
top-left, y down: already the convention of the PDF display space). The
neatline is the image footprint (4 corners); content outside it is
transparent, and so are the nodata pixels / alpha.

`datumCompatible` is true when the CRS definition is known (the datum shift is
applied by proj4); a definition without datum information gives the same
warning as PDFs.

**Native zoom**: from the pixel size in meters (pixel scale, converted for
geographic CRSs) instead of the PDF render DPI; the georeference gets a
`renderScale` (display units → rendered pixels: `200 / 72` for PDFs, `1` for
GeoTIFFs) used by the zoom range computation.

### 3. Rendering the tiles

New native function in `modules/imported-map-renderer`, next to `renderTiles`
(PDF):

```ts
renderImageTiles({
  pixels: Uint8Array,          // RGBA, interleaved
  pixelsWidth, pixelsHeight,
  matrix: [a, b, c, d, e, f],  // window pixels → block pixels
  clipPolygon: number[],       // map frame in block pixels
  width, height, tileSize, jpegQuality,
  tiles: RenderTileTarget[],   // same as renderTiles
}): Promise<TilesWriteResult>
```

- for each block (1024 px): the planner gives the display → block matrix;
  the JS side computes the image window covered by the block (inverse matrix
  on the block corners, plus a 1 px margin), the window size matching the
  block resolution (never above the source resolution), decodes it with
  geotiff.js and passes it with the matrix adjusted to the window;
- Android: `Bitmap.copyPixelsFromBuffer` + `Canvas.drawBitmap(bitmap, matrix,
  filterPaint)` with the clip path; iOS: `CGImage` from the buffer drawn with
  a `CGAffineTransform` (bilinear interpolation on both);
- memory per block: a few MB (window ~1–1.5k² px × 4 bytes); the `Uint8Array`
  goes to native code without base64 (Expo modules typed arrays);
- tile writing shared with `renderTiles`.

This is the only native change: the next app version needs a new native build
(as for PDF maps, in Expo Go and older builds the import is disabled).

### 4. Model and storage

- `ImportedMap`: `sourceType: "pdf" | "geotiff"` (missing → `"pdf"` for the
  maps imported by 2.11.3), `pageIndex` only for PDFs, `crs` (label shown in
  the list, e.g. "EPSG:32633").
- The source GeoTIFF is **not kept** after the import (the PDF is kept to be
  able to re-render it): GeoTIFFs are often much bigger than the tiles at the
  chosen zoom; `sourceSizeBytes` is 0. The copy made by the document picker
  in the cache is deleted after the import.
- Tiles in `pdf_maps/{id}/tiles` as for PDFs (folder name kept, see above).

### 5. Import screen and UI

- File picker: `application/pdf`, `image/tiff` (some Android file providers
  report `.tif` files as `application/octet-stream`: the type is detected
  from the first bytes of the file, `%PDF` or `II*\0` / `MM\0*` / BigTIFF).
- Analysis: one candidate per file (the full resolution image; the other
  images are overviews or masks). The page selector is hidden.
- Same name, max zoom slider, estimate, preview and warnings. For big files
  without overviews the preview has to read the whole image: it shows a
  progress indicator and can be skipped.
- Errors: not georeferenced, unsupported CRS, unsupported pixel format
  (e.g. 16-bit / float data, more than 4 bands: DEMs, raw satellite bands),
  unsupported compression (LERC, Zstandard), file too big for the 100 000
  tiles limit at the min zoom.
- Texts: tab "PDF maps" → "Imported maps", "Import PDF" → "Import map",
  descriptions mentioning PDF and GeoTIFF, PDF icon → map icon; "Only PDF"
  switch → "Only imported map". All languages updated, "What's new" entry.

## Out of scope (first iteration)

- 16-bit/float rasters (would need a min/max stretch or a color ramp), more
  than 4 bands (band choice).
- Plain images with sidecar files (`.tfw` world file + `.prj`), `.aux.xml`.
- MBTiles (same overlay machinery, simpler: the tiles are already there).
- Re-rendering a GeoTIFF map at a different zoom (source not kept).

## Plan

1. **Rename + this note** (this PR).
2. **Spike** (de-risk geotiff.js on Hermes): Metro resolution of the package
   (`exports`, `web-worker` dependency, dynamic `import()` of the decoders),
   `TextDecoder`, custom `FileHandle` source; decoding time on a mid-range
   Android device for a 100–300 MB LZW / JPEG GeoTIFF, with and without
   overviews; bundle size of `geotiff-geokeys-to-proj4`.
3. **GeoTIFF reading and georeference** (pure JS, unit tests with small
   fixtures made with GDAL: UTM 33N LZW RGB, EPSG:4326 Deflate grayscale with
   nodata, palette, tiled JPEG/YCbCr COG with overviews, rotated
   (`ModelTransformation`), user-defined Lambert conformal conic, 16-bit
   (rejected), not georeferenced (rejected)); generic parts of transform and
   planner split from the PDF ones.
4. **Rendering and UI**: native `renderImageTiles` (Android, iOS), import
   job/preview for both sources, model, import screen, texts and
   translations, user manual sections to update.

## Testing

- `yarn test:types`, `yarn lint`, `yarn test` (parser, georeference grid,
  window computation for a block, settings migration).
- Like for PDFs, emulate the pipeline offline: render the tiles from a
  fixture with the same matrices/windows (Python + GDAL as reference) and
  check that known points land within 1 px.
- Devices: Android and iOS, big real files (national orthophotos, scanned
  topographic sheets), import time and memory, accuracy against GPS in the
  field, airplane mode; maps imported by 2.11.3 still shown after the update.

## Risks

- **geotiff.js on Hermes** (bundling, missing web APIs): checked first, in the
  spike. Fallback: a native TIFF decoder (libtiff), more native code.
- **Import time** of big files decoded in JS; mitigated by overviews (COG),
  zoom choice, cancel. Preview of big files without overviews.
- **CRS coverage**: codes missing in the bundled tables and not in the
  survey → not supported (message names the EPSG code).
- Very large extents: a single homography is not enough → split (phase 2).
