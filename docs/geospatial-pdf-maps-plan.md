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
  in the existing tile cache: both platforms decode by content – *to verify*
  with `LocalTile`).

Estimated volume: a 1:50 000 sheet (≈ 20 × 20 km) at z17 ≈ 4 400 tiles (+⅓
for the lower zooms), ~20–40 KB each → ≈ 100–250 MB; at z16 ¼ of that. The
import screen shows the estimate and lets the user lower the max zoom (same UX
as the offline area editor).

### 4. Showing the PDF on the map

`MapView` renders, for each visible PDF layer, a tile overlay **above the base
map and below the app overlays** (markers, polygons, location dot):

- `LocalTile` (`pathTemplate = {dir}/{z}/{x}/{y}`, `tileSize = 256`) – works
  with both the default provider (Google/Apple) and the free layers;
  alternative: `UrlTile` with a `file://` template + `maximumNativeZ` so the
  last zoom is up-scaled when zooming further (*to verify* which of the two
  supports `opacity` and over-zoom in react-native-maps 1.27.2);
- per-layer **opacity** (useful to compare the sheet with the imagery);
- the PDF attribution/name is shown in the existing attribution area.

Layer selection on the map: today the layers button cycles the base layers.
Replace the cycling with a small **layers panel** (same style as
`RecordsMapLayersPanel`): base layer (radio) + PDF maps (checkboxes, opacity
slider, "zoom to map" button). Visible PDF layers are stored in the settings so
they are shown in all the maps.

### 5. Data and services

- `src/model/PdfMapLayer.ts`:
  `{ id, name, sourceFileName, pageIndex, viewportIndex, neatline: LatLng[],
  minZoom, maxZoom, tilesCount, sizeBytes, sourceSizeBytes, keepSource,
  datumWarning?, status: "importing" | "ready" | "incomplete", dateCreated,
  dateModified }`;
- `src/service/pdfMaps/pdfMapLayerRepository.ts`: metadata in AsyncStorage
  (`@pdfMapLayers`), like `OfflineMapAreaRepository`;
- `src/service/pdfMaps/PdfMapLayerImportJob.ts`: `JobMobile` (progress +
  cancel through `JobMonitorActions.startAsync`, like
  `OfflineMapAreaDownloadJob`): copy PDF → parse → compute tiles → render max
  zoom blocks → build overviews → save metadata; resumable (skips existing
  tiles) so an interrupted import can be completed;
- `src/service/pdfMaps/pdfMapsService.ts`: import, list, rename, delete (tiles +
  source), storage used, visibility/opacity;
- files:
  - source PDF: `documentDirectory/map_pdfs/{id}.pdf` (kept by default to be
    able to re-render at another zoom; option to delete it after import to
    save space);
  - tiles: `documentDirectory/map_tiles/pdf_{id}/` → already excluded from the
    full backup (same root folder as the offline areas).
- PDF layers are **overlays**, not base layers: they are not added to
  `MapLayers.getLayers()` (no prefetch, no `UrlTile` cache) to avoid mixing them
  with the base layer logic.

### 6. UI

- **Settings → Maps → "PDF maps"** button → `screenKeys.pdfMaps` screen (also
  from the map layers panel):
  - list: name, page, zoom range, tiles, size, status; actions: show on map,
    rename, re-render (other max zoom), delete; total storage used + free disk
    space; **Import PDF** button;
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

## Phases

1. **Spike (de-risk)**: native module rendering one 1024 px block of a page
   with an affine matrix on Android + iOS; measure time per block on a vector
   and on a raster sheet; check `LocalTile` over Google/Apple maps (opacity,
   over-zoom, extension-less PNG/JPEG).
2. **MVP**: ISO 32000 parsing, homography, import job, PDF maps screen, overlay
   in `MapView` with visibility toggle, unit tests.
3. **Improvements**: layers panel with opacity, OGC `LGIDict`, `proj4` for
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
