# Geospatial PDF maps – implementation plan

Branch: `feat/geospatial-pdf-maps`

## Goals

1. Let the user **import geospatial PDFs** (georeferenced map sheets, e.g. the
   ones produced by national mapping agencies, ArcGIS/QGIS exports, Avenza-style
   maps) from the device storage and **store them in the app**.
2. Show an imported PDF **as an overlay on every map** of the app (`geo`
   attribute editor, coordinate target map, location viewer, records map,
   offline area editor), on top of the current base map (Google/Apple or the
   free layers), **fully offline**.
3. Manage the imported PDF maps: name, extent, size, visibility, opacity,
   delete.
4. Show the **current location** on the PDF (already given for free by
   `MapView` + `CurrentLocationDot`).

Non goals (first iteration): editing the PDF, PDF optional-content layers
(toggling the PDF's own layers), manual georeferencing of plain PDFs (see
*Future work*).

## What a "geospatial PDF" contains

Two encodings exist; both store, for a region of a page, the relation between
page coordinates and geographic coordinates:

| Encoding | Where | Content |
|---|---|---|
| **ISO 32000 / Adobe "geospatial PDF"** (most common today: ArcGIS, QGIS, GDAL, USGS, Avenza exports) | page `/VP` array → viewport (`/BBox`) → `/Measure` dict with `/Subtype /GEO` | `/GPTS` (lat/lon pairs, usually the 4 corners of the map frame), `/LPTS` (same points in unit coordinates of the viewport `/BBox`), `/Bounds` (neatline polygon), `/GCS` (WKT or EPSG of the datum/projection) |
| **OGC "GeoPDF" best practice** (older TerraGo files) | page `/LGIDict` | `/Registration` points (page ↔ projected coords), `/Projection` dict (type, zone, datum) |

A page can contain several viewports (main map + inset/overview map): the main
map frame is the viewport with the largest `/BBox` area.

## Approach

### Options evaluated

| | A. Single image `Overlay` | B. **Tile pyramid generated on the device** | C. Conversion on the Arena server |
|---|---|---|---|
| Offline | yes | yes | needs connection at import time |
| Resolution | limited: one bitmap (a 1:25k A1 sheet at 300 dpi is ~7000×10000 px ≈ 280 MB in memory) | full, zoom levels like any map | full |
| Rotated sheets (UTM grid vs. north) | only via `bearing` (Google only), no warping | handled by the transform used while rendering | handled (GDAL) |
| New native code | PDF rasterizer | PDF rasterizer | none in the app, GDAL on the server |
| Fits current code | new overlay type | **reuses the tile machinery (`map_tiles`, `MapTileUtils`, jobs, storage screens)** | needs server work and an upload/download flow |

**Decision: B** – on import, the PDF is rendered once into an XYZ (Web
Mercator) tile pyramid stored in `map_tiles/{pdfLayerId}/{z}/{x}/{y}`, the same
layout already used for the offline areas. The map shows it with a local tile
overlay. After that, the PDF does not need to be parsed again while the map is
used, so maps stay smooth and memory usage is low. Option C remains a possible
addition (see *Future work*).

### 1. Reading the georeference (pure JS)

`src/utils/GeoPdfParser.ts`, using **`pdf-lib`** (pure JS, no native code,
already proven in RN) to read the low-level page dictionaries (no rendering):

- for every page: read `/VP`, keep the viewports whose `/Measure /Subtype` is
  `/GEO`; read `/BBox`, `/GPTS`, `/LPTS`, `/Bounds`, `/GCS` (WKT or EPSG);
- fallback: `/LGIDict` (OGC) – phase 2;
- result: `GeoPdfPage[]` → `{ pageIndex, pageSize, viewports: [{ bbox,
  controlPoints: [{ page: {x, y}, geo: {lat, lng} }], neatline, crs }] }`;
- PDFs without a georeference → clear error message ("this PDF is not
  georeferenced").
- `LPTS` and `Bounds` are unit coordinates relative to the `BBox` **as written
  in the file** (first corner = origin), as GDAL reads them: ArcGIS writes the
  `BBox` top corner first (e.g. `[21.6 1634.4 2569.9 21.65]` with
  `LPTS [0 1 0 0 1 0 1 1]`); sorting the `BBox` would place the map mirrored
  vertically. As a further safeguard, a map is never a mirror image of the
  ground: when the control points still describe a mirrored map (negative
  determinant of the user space → mercator transform) the y axis of
  `LPTS`/`Bounds` is inverted (`verticallyFlipped`). The georeferencing read
  from the file is written to the app log, to diagnose wrongly placed maps.

Note: `pdf-lib` loads the whole file in memory; geospatial PDFs with embedded
imagery can be 50–200 MB. If that is a problem, read only the cross-reference
table and the page objects with a small dedicated parser, or move the parsing
to the native module (both platforms can access page dictionaries:
`PDFKit`/`CGPDFDictionary` on iOS; on Android `PdfRenderer` can't, so it would
need e.g. `pdfbox-android`). Start with `pdf-lib`, measure with a big file.

### 2. Page → map transform (pure JS, unit tested)

`src/utils/GeoPdfTransform.ts`:

- convert the control points' lat/lon to Web Mercator meters;
- with 4 control points compute a **projective transform (homography)** page →
  mercator (with exactly 3, an affine one; with more, least squares);
- for a map sheet of a few tens of km the difference between the real
  projection (e.g. UTM) and the homography is far below the pixel size; for
  very large extents (≈ > 1°), when `/GCS` is known, densify the control grid
  with **`proj4`** (pure JS) and use one transform per tile (phase 2);
- datum: `/GPTS` are expressed in the datum of `/GCS`; WGS84/ETRS89/NAD83/
  GDA are treated as WGS84 (sub-meter differences); other datums (e.g. NAD27,
  ED50) → shift with `proj4` when the definition is known, otherwise show a
  warning on import.

Also computed here:

- **extent** (neatline polygon in lat/lon) → used to compute tiles
  (`MapTileUtils.computeTilesForPolygon`, already there), to draw the outline
  and to "zoom to map";
- **max zoom**: native resolution of the sheet (meters per page point at the
  chosen render DPI) → `ceil(log2(156543.03 · cos(lat) / metersPerPixel))`,
  capped (e.g. 19); default render DPI ~ 200 (configurable as "quality");
- **min zoom**: the zoom where the whole sheet fits in ~1–2 tiles.

### 3. Rendering the tiles (small native Expo module)

There is no PDF rasterizer among the current dependencies, and existing RN PDF
libraries only render whole pages for viewing/thumbnails. A **local Expo
module** `modules/pdf-map-renderer` (Expo Modules API, autolinked by prebuild,
like any other native dependency of the dev/production builds):

- Android: `android.graphics.pdf.PdfRenderer` – `Page.render(bitmap, clip,
  matrix, mode)` accepts an **arbitrary affine `Matrix`**;
- iOS: `PDFKit` / `CGContext` with a `CGAffineTransform`.

API (async, runs off the JS thread):

```ts
renderTileBlock({
  pdfUri, pageIndex,
  // affine transform page points → block pixels (linearization of the homography over the block)
  matrix: [a, b, c, d, tx, ty],
  neatline: { x, y }[], // clip: outside the map frame tiles are transparent (no legend/collar over the base map)
  blockSize: 1024,      // 4×4 tiles rendered per call
  tileSize: 256,
  outDir, z, x0, y0,    // writes {outDir}/{z}/{x}/{y} for the non-empty tiles
}): Promise<{ written: number; bytes: number }>

buildOverview({ outDir, z, x, y }): Promise<...> // 2×2 downsample of z+1 tiles
```

Why this shape:

- the homography is linearized **per block** (1024 px): the error of an affine
  approximation over a block is negligible, so there is no per-pixel warping
  in JS, and rotation/skew of the sheet is handled by the matrix;
- rendering blocks instead of single tiles divides the number of PDF content
  stream passes by 16 (vector PDFs re-parse their content at every render);
- only the **max zoom** is rendered from the PDF; lower zooms are built by
  downsampling (fast, and consistent);
- tiles fully outside the neatline are skipped; edge tiles are PNG with alpha,
  interior tiles can be JPEG to save space (file names without extension, as
  in the existing tile cache: the tile overlays of both platforms decode them
  by content).

Estimated volume: a 1:50 000 sheet (≈ 20 × 20 km) at z17 ≈ 4 400 tiles (+⅓
for the lower zooms), ~20–40 KB each → ≈ 100–250 MB; at z16 ¼ of that. The
import screen shows the estimate and lets the user lower the max zoom (same UX
as the offline area editor).

### 4. Showing the PDF on the map

`MapView` renders, for each visible PDF map, a tile overlay **above the base
map and below the app overlays** (markers, polygons, location dot):

- `UrlTile` in **offline mode** with `tileCachePath` = the tiles folder of the
  PDF map: tiles are only read from the device (checked in the native sources
  of react-native-maps 1.27.2, Android and iOS). Compared to `LocalTile` it
  supports `opacity` and **over-zoom** (`maximumNativeZ`: above the max zoom
  of the PDF the tiles of the max zoom are scaled), and it works with both the
  default provider (Google/Apple) and the free layers;
- per-map **opacity** (useful to compare the sheet with the imagery).

Layer selection on the map: a second button (PDF icon) below the existing
layers button opens a **PDF maps panel**: one item per PDF map with a
checkbox (visible), an opacity slider and a "zoom to map" button. Visibility
and opacity are stored in the settings, so they apply to all the maps.

### 5. Data and services

- `src/model/PdfMap.ts`:
  `{ id, name, fileName, pageIndex, neatline: LatLng[], minZoom, maxZoom,
  tilesCount, sizeBytes, sourceSizeBytes, datumCompatible, visible, opacity,
  dateCreated, dateModified }`;
- the PDF maps are stored in the **settings** (`pdfMaps`, like
  `customMapLayers`): `MapView` reads them from the Redux settings state, so a
  change of visibility/opacity is applied to all the maps immediately;
  `src/service/pdfMaps/pdfMapRepository.ts` reads/writes them;
- `src/service/pdfMaps/PdfMapImportJob.ts`: `JobMobile` (progress + cancel
  through `JobMonitorActions.startAsync`, like `OfflineMapAreaDownloadJob`):
  copy PDF → check that the native renderer can open it → render max zoom
  blocks → build overviews → save the map; on cancel or error the files are
  deleted;
- `src/service/pdfMaps/pdfMapsService.ts`: analyze file (pages/georeference/
  zoom range), estimate, default name, name validation, import job, update
  (name, visible, opacity), delete (map folder), storage used;
- files: `documentDirectory/pdf_maps/{id}/source.pdf` (kept, to be able to
  re-render the map later) and `documentDirectory/pdf_maps/{id}/tiles/{z}/{x}/{y}`;
  the `pdf_maps` folder is excluded from the full backup, like `map_tiles`;
  it is separated from `map_tiles` because "Delete all" in the offline areas
  deletes that whole folder;
- PDF maps are **overlays**, not base layers: they are not added to
  `MapLayers.getLayers()`.

### 6. UI

- The **Offline maps** screen has two tabs (segmented buttons): **Downloaded
  areas** (the existing content) and **PDF maps**. **Settings → Maps → "PDF
  maps"** opens the Offline maps screen on the PDF maps tab.
- **PDF maps tab**: description, storage used by PDF maps + free disk space,
  **Import PDF** button, list of the maps (name, file, page, zoom range,
  tiles, size, datum warning, "Show on maps" switch, delete); tapping a map
  opens the **PDF map viewer** (`screenKeys.pdfMapViewer`): rename + map
  preview (the PDF map is shown even if hidden in the settings).
- **Preview before the import**: when a page is selected, its lowest zoom
  levels (4) are rendered into a temporary folder (`cache/pdf_map_previews`)
  with the same pipeline used by the import, and shown on the map of the
  import screen; so the user sees exactly where and how the PDF will be placed.
- **Zoom controls** (`MapView` `showZoomControls`, import screen and viewer):
  current zoom level (computed from the visible region, Apple Maps doesn't
  give the camera zoom) and +/- buttons.
- **"Only PDF" switch** (import screen and viewer): hides the base map
  (`MapView` `baseMapHidden`: Google map type `none` on Android, tile overlays
  replacing the Apple map content on iOS), to check what is in the PDF alone.
- When the native renderer is not available (Expo Go, old builds) the import
  button is disabled and a message is shown.
- **Import flow** (`screenKeys.pdfMapImport`):
  1. pick the file (`expo-document-picker`, `application/pdf`, already a
     dependency);
  2. parse; if the file has several georeferenced pages/viewports, choose which
     ones (one layer per page);
  3. preview: neatline drawn on a `MapView` + name + max zoom slider with live
     estimate `N tiles · ~X MB (free: Y GB)` + warnings (datum, too many tiles,
     not enough space);
  4. **Import** → job with progress dialog → back to the list.
- Android "Open with…"/share intent to Arena Mobile for `.pdf` files (nice to
  have, phase 2; needs an intent filter config plugin).

### 7. Localization

New `pdfMaps` namespace (English); other languages fall back to English, as for
`offlineMaps`.

## Implementation status

Implemented in this branch:

- [x] `GeoPdfParser` (ISO 32000 georeferencing with `pdf-lib`; OGC `LGIDict`
  detected and reported as not supported), `GeoPdfTransform` (homography,
  page rotation, mercator/tile math, native zoom), `GeoPdfTilePlanner`
  (render blocks of 4×4 tiles, overview tiles) with Jest tests.
- [x] Local Expo module `modules/pdf-map-renderer` (Android `PdfRenderer`, iOS
  CoreGraphics): `renderTiles` (white paper + clip to the map frame, empty
  tiles skipped, JPEG for opaque tiles, PNG otherwise), `buildOverviewTiles`,
  `getPageCount`, `closeDocument`.
- [x] `PdfMap` model in the settings, repository, service, import job.
- [x] `MapView`: visible PDF maps as offline `UrlTile` overlays (opacity,
  over-zoom), PDF maps panel (visibility, opacity, zoom to map).
- [x] Offline maps screen with tabs, PDF maps tab, import screen (page choice,
  name, max zoom slider, live estimate, low space confirmation, datum
  warning), viewer screen (rename, preview), Settings button.
- [x] Low resolution preview on the import screen and "Only PDF" switch
  (import screen, viewer).
- [x] Full backup excludes `pdf_maps`.
- [x] English strings (other languages fall back to English).

Verified without a device:

- `yarn test:types`, `yarn test` (parser, transform, planner).
- The whole tile pipeline was emulated with **pdfium** (the engine of Android
  `PdfRenderer`, through `pypdfium2`), passing the matrices and clip polygons
  computed by the planner: markers drawn at known coordinates in a test
  geospatial PDF end up within 0.6 px of their expected position in the
  tiles, for pages with `/Rotate` 0 and 90; the legend outside the map frame
  is not rendered.
- The Kotlin module compiles against the Android 14 framework classes (with
  stubs of the Expo modules API); a full Gradle/Xcode build was not possible
  in the development container.

Still to do: build and test on Android/iOS devices (in particular the iOS
rendering of pages with `/Rotate`), measure the import time of big PDFs,
translations; phase 3 items below.

## Phases

1. **Spike (de-risk)**: native module rendering one 1024 px block of a page
   with an affine matrix on Android + iOS; measure time per block on a vector
   and on a raster sheet; check the PDF tile overlay over Google/Apple maps
   (opacity, over-zoom, extension-less PNG/JPEG).
2. **MVP**: ISO 32000 parsing, homography, import job, PDF maps screen, overlay
   in `MapView` with visibility toggle, unit tests.
3. **Improvements**: OGC `LGIDict`, `proj4` for
   non-WGS84 datums and large extents, re-render, share intent, translations.

## Testing

- Jest: `GeoPdfParser` (fixtures: small geospatial PDFs generated with GDAL –
  `gdal_translate -of PDF` from a tiny GeoTIFF in UTM, rotated grid, two
  viewports, non georeferenced PDF), `GeoPdfTransform` (homography from known
  points, zoom computation, neatline → tiles).
- `yarn test:types`, `yarn lint`, `yarn test`.
- Maestro: import a fixture PDF and check it is listed (needs the file on the
  device; optional).
- Manual on devices: big real sheets (USGS US Topo, national agency sheets),
  memory/time of the import, accuracy vs. GPS in the field, airplane mode.

## Risks / open points

- **Import time** of large vector PDFs (mitigated by block rendering, zoom
  choice, resumable job; to measure in the spike).
- **Disk usage** of the tiles (estimate + free space check before import;
  option to delete the source PDF).
- `PdfRenderer` (Android) does not open encrypted/password protected PDFs →
  error message.
- `pdf-lib` memory with very big files (see §1).
- Accuracy depends on the datum handling (warning when not WGS84-compatible).

## Future work

- **Manual georeferencing** of plain PDFs/images: the user places ≥ 3 control
  points on the PDF and on the map (same transform code).
- Import of other offline formats with the same overlay machinery: **MBTiles**
  (SQLite, easy: just extract the tiles) and **GeoTIFF**.
- **Survey maps from Arena**: PDF/MBTiles maps attached to a survey on the
  server, converted there (GDAL) and downloaded together with the survey.
- Optional MapLibre engine (see `offline-maps-plan.md`), which supports raster
  sources natively.
