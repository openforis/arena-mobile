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
- decoding of single tiles/strips (`getTileOrStrip` with the decoder of the
  compression); the window of a block is assembled by our code (see *Spike
  results*: `readRGB` reads every sample through a `DataView`, 2–4× slower
  without JIT): decoded rows copied into an RGBA buffer, conversion only for
  grayscale, palette and YCbCr (JPEG tiles are decoded to YCbCr);
- compressions: none, PackBits, LZW (our typed-array decoder, registered
  with `addDecoder`), Deflate, JPEG (all in JS). LERC and Zstandard use
  WebAssembly decoders, not available on Hermes → those files are rejected
  with a message.

Metro: `web-worker` (decoder pool, node entry not bundleable), the inline
worker source (`geotiff/dist-module/worker/create.js`, 246 KB) and the
WebAssembly decoders (`lerc`, `zstddec`) are resolved to empty modules in
`metro.config.js`; `fs` is already replaced by the package `browser` field.

**File access**: GeoTIFFs can be hundreds of MB, they must not be read in
memory as a whole (as `GeoPdfParser` does with PDFs). A geotiff.js custom
source reads byte ranges with the `expo-file-system` `FileHandle`
(`offset` + `readBytes`), so only the header, the IFDs and the strips/tiles
needed by a block are read; contiguous slices are read with one call (strips
of uncompressed or LZW files are often a few KB: thousands of reads).

Everything runs on the JS thread (no web workers in React Native): tiles and
strips are decoded one at a time, and the decoding yields to the event loop
when the JS thread has been busy for more than 50 ms, so the UI stays
responsive (progress dialog, cancel); the longest uninterrupted step is the
decoding of one tile/strip.

Stripped files with full-width strips: a strip covers several blocks of the
same row, so decoded strips are kept (small LRU cache, blocks processed row
by row) instead of being decoded again for each block (8× slower otherwise
on an 8000 px wide image).

### 2. Georeference → homography

`src/utils/GeoTiffParser.ts` (pure JS, unit tested):

1. raster → CRS affine from the tie point + pixel scale or the transformation
   matrix (with the "pixel is point" shift);
2. CRS definition, in this order:
   - GeoKeys → proj4 definition (EPSG code or user-defined parameters) with
     [`geotiff-geokeys-to-proj4`](https://github.com/matafokka/geotiff-geokeys-to-proj4)
     (it includes the EPSG tables needed for the codes; +355 KB in the
     bundle);
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

`datumCompatible` is true when the datum is WGS84-compatible or the
definition has the datum shift (`+towgs84` / `+nadgrids`, applied by proj4).
`geotiff-geokeys-to-proj4` doesn't always give it: for EPSG:27700 (British
National Grid, OSGB36) the map is ~105 m off. Then the survey SRS with the
same code (its WKT usually has `TOWGS84`) or a small table of 7-parameter
shifts for common datums is used; otherwise the map gets the datum warning.

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
  on the block corners, plus a 1 px margin), decodes it at the resolution of
  the closest overview at or above the block resolution (no resampling in
  JS: the native side scales; without overviews, rows/columns are decimated
  while copying, for the low zooms of the preview) and passes it with the
  matrix adjusted to the window;
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
2. **Spike** (done, see *Spike results*). No separate device benchmark: the
   import runs as a job with progress and cancel, whatever its duration; the
   timings of the first imports on devices tell whether native JPEG decoding
   is worth it.
3. **GeoTIFF reading and georeference** (pure JS, unit tests with small
   fixtures made with GDAL: UTM 33N LZW RGB, EPSG:4326 Deflate grayscale with
   nodata, palette, tiled JPEG/YCbCr COG with overviews, rotated
   (`ModelTransformation`), user-defined Lambert conformal conic, 16-bit
   (rejected), not georeferenced (rejected)); generic parts of transform and
   planner split from the PDF ones.
4. **Rendering and UI**: native `renderImageTiles` (Android, iOS), import
   job/preview for both sources, model, import screen, texts and
   translations, user manual sections to update.

## Spike results

Done in the development container with GDAL 3.12 fixtures (synthetic
orthophoto 8000×8000 px, UTM 33N, in several compressions, plus 2000×2000
px and special cases). Scripts and fixtures are not committed (generated
again with GDAL for the unit tests of step 3).

**Bundling** (`expo export:embed`, Android, minified; Hermes bytecode compiled
by the project `hermesc` without errors):

- fails until `web-worker` is resolved to an empty module (its node entry
  has an `import()` Metro can't transform); `fs` is fine (`browser` field);
- size added to the JS bundle: geotiff.js +259 KB (after stubbing the inline
  worker and the WebAssembly decoders: +602 KB without),
  `geotiff-geokeys-to-proj4` +355 KB; `proj4` is already in the bundle
  (arena-core).

**Georeference** (corners and center vs GDAL): exact (< 1 mm) for UTM
WGS84, EPSG:4326 grayscale, ED50 / UTM (EPSG:23033, `+towgs84` given),
user-defined Lambert conformal conic with `TOWGS84`, rotated image
(`ModelTransformation`), palette, RGBA. **EPSG:27700: ~105 m** (no datum
shift, see §2). Not georeferenced files are detected (no tie point /
transformation, no GeoKeys). Header and IFDs: 2–15 reads, < 8 KB, < 10 ms.

**Decoding**, 1024×1024 windows over the whole image, Node 22 on the
container CPU; `--jitless` (no JIT, like Hermes) is the relevant column,
Mpx/s:

| File (2000×2000, RGB) | `readRGB`, jitless | fast path, jitless | fast path, JIT |
|---|---|---|---|
| uncompressed (strips) | 1.8 | 6.8 | 33 |
| PackBits (strips) | 1.0 | 2.1 | 17 |
| LZW (strips) | 0.2 | 0.5 (typed-array LZW) | 7.8 |
| Deflate + predictor (tiled 256) | 1.0 | 1.5 | 16 |
| JPEG YCbCr (tiled 256) | 0.7 | 1.0 | 11 |

- fast path = tiles/strips copied into the RGBA window (identical output to
  `readRGB`, ±1 for JPEG YCbCr conversion); our LZW decoder: same output,
  2–4× faster than geotiff's (JS arrays, one allocation per code);
- 8000×8000 (64 Mpx), JIT: JPEG COG 5.0 s, Deflate 3.1 s, LZW full-width
  strips 24 s (strips decoded again for each block: strip cache needed);
- memory: heap < 30 MB with 1024² windows; the file is never in memory;
- low zooms with overviews (COG): whole image → 1024² from the 2000 px
  overview in 0.4 s, reading 0.4 MB; without overviews the whole file is
  read (150 MB Deflate: 6.9 s with JIT).

Estimate on phones (2–3× slower than this CPU without JIT): a 64 Mpx JPEG
orthophoto at the native zoom ~2–4 min, Deflate ~1.5–3 min, LZW ~4–8 min,
plus the native rendering. Acceptable for a one-time import with progress and
cancel; slow for 300+ Mpx files. If too slow on devices, the most common case (JPEG-compressed tiles) can be decoded
natively instead: each TIFF JPEG tile + `JPEGTables` is a standalone JPEG
stream for `BitmapFactory` / ImageIO (10× faster or more), with geotiff.js
still used for the structure and the other compressions.

**Not verified** (no Hermes VM in the container): `TextDecoder` (used by
geotiff.js for ASCII tags; a tiny fallback is installed if Hermes lacks it)
and the actual Hermes timings (first imports on devices).

## Reading code

Already in `src/utils/geoTiff/` (used by step 3): file source on the
expo-file-system `FileHandle` (serial reads, contiguous ranges merged), LZW
decoder, pixel formats, RGBA window reader with strip cache and time slicing
(tiles decoded one at a time, yield to the event loop after 50 ms: JS thread
blocked max ~40 ms per step in the container), georeference, `TextDecoder`
fallback. Unit tested with small GDAL fixtures
(`src/utils/geoTiff/__fixtures__/generate.py`: expected corners and pixels
computed by GDAL).

Noticed: tiled files need 2 small reads per tile for the offsets and byte
counts (`loadValueIndexed`) besides the data; reading those arrays once would
reduce the native calls.

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

- **Import time** of big files decoded in JS (see *Spike results*):
  mitigated by the fast path, overviews (COG), zoom choice, cancel; next
  option: native decoding of JPEG tiles. Preview of big files without
  overviews reads the whole file.
- **Hermes runtime** (`TextDecoder`, timings): bundling and bytecode
  compilation verified, runtime only on devices. Fallback: a native TIFF
  decoder (libtiff), more native code.
- **CRS coverage**: codes missing in the bundled tables and not in the
  survey → not supported (message names the EPSG code).
- Very large extents: a single homography is not enough → split (phase 2).
