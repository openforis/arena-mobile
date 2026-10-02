# Offline maps & alternative map provider – implementation plan

Branch: `feat/map-pre-loading`

## Goals

1. A setting to choose the map used when drawing/viewing `geo` attributes:
   - **Default** (Google Maps on Android, Apple Maps on iOS) – current behaviour.
   - **Free map layers** – raster tiles from free/open providers (satellite and
     topographic), rendered by the app itself, usable offline.
2. A way to **draw an area of interest** on the map and **pre-fetch** its tiles
   before going to the field (where there is usually no connection).
3. A screen to **manage the pre-fetched areas**: layer used (satellite /
   topographic), zoom levels, number of tiles, occupied size, total size, delete.
4. While drawing an area, show a **live estimate** of the tiles/size that the
   download will occupy (plus the free disk space).
5. Reuse (and improve) the existing polygon editor (`GeoPolygonEditor`) for
   drawing the area.

## Rendering engine: MapLibre vs. tile layers on `react-native-maps`

Two options were evaluated:

| | MapLibre (`@maplibre/maplibre-react-native`) | Tile layer on current `react-native-maps` |
|---|---|---|
| Free base map | yes (vector/raster styles) | yes (raster `UrlTile`) |
| Offline packs | built-in `OfflineManager` | own downloader writing into the tile cache folder that `UrlTile` already reads (`tileCachePath` + `offlineMode`) |
| Polygon editor | must be rewritten (markers, draggable vertices, polygons, press events all have different APIs) | **reused as is** – overlays stay the same |
| New native dependency | yes (+ config plugin, bigger APK, new build risk) | no |
| Google ToS | n/a | Google tiles are never downloaded; only free layers are pre-fetched |

**Decision:** use `UrlTile` layers on top of the existing `react-native-maps`
view (`mapType="none"` on Android / `shouldReplaceMapContent` on iOS so only the
free layer is visible). It gives a free, offline-capable map with no new native
module and keeps the whole polygon editor. The map component is wrapped in our
own `MapView`, so switching the engine to MapLibre later stays possible (and
would only touch `components/MapView` + the overlay components).

### How the offline cache works

`UrlTile` with `tileCachePath` stores/reads tiles at
`{tileCachePath}/{z}/{x}/{y}` (same layout on Android and iOS, verified in the
native sources of react-native-maps 1.27). The downloader writes pre-fetched
tiles to exactly that layout, so:

- online: tiles are read from the cache, missing ones are fetched and cached;
- offline (`offlineMode` = no network, via NetInfo): only cached tiles are used,
  missing ones are rendered by up-scaling lower zoom tiles (native behaviour);
- `tileCacheMaxAge` is set to a long period (1 year) so pre-fetched tiles are
  not re-downloaded in the background.

One cache folder per layer: `documentDirectory/map_tiles/{layerId}/`. Areas of
the same layer share tiles (overlapping areas are not downloaded twice).

## Map layers (free providers)

Defined in `src/model/MapLayers.ts`:

| id | type | url | max zoom | prefetch |
|---|---|---|---|---|
| `esriWorldImagery` | satellite | `server.arcgisonline.com/.../World_Imagery/MapServer/tile/{z}/{y}/{x}` | 19 | yes |
| `openTopoMap` | topographic | `tile.opentopomap.org/{z}/{x}/{y}.png` | 17 | yes |
| `openStreetMap` | standard | `tile.openstreetmap.org/{z}/{x}/{y}.png` | 19 | **no** (OSM tile usage policy forbids bulk downloads) |

Every layer has an attribution text shown on the map. The downloader is
throttled (limited concurrency, identifying `User-Agent`) and an area is capped
to a maximum number of tiles, to be a good citizen with these free services.

> ⚠️ Terms of use of free tile providers must be respected: heavy use may need
> a licensed/own tile server. A "custom tile URL" layer can be added later (see
> *Future work*).

## Settings

New settings group **Maps** (`SettingGroup.maps`):

- `mapProvider`: `default` | `freeLayers` (dropdown).
- `mapLayer`: default free layer (dropdown; hidden when provider is `default`).
- Button **Offline maps** → opens the management screen.

The layers button already present on the map cycles Google map types
(standard/satellite/hybrid) with the default provider and the free layers
with the free provider.

## Tile math – `src/utils/MapTileUtils.ts` (unit tested)

- `lonToTileX`, `latToTileY`, `tileToLatLngBounds` (Web Mercator XYZ).
- `computeTilesForPolygon({ coordinates, minZoom, maxZoom })`: for each zoom,
  iterate over the tiles of the polygon bounding box and keep those intersecting
  the polygon (tile centre/corners inside polygon, polygon vertex inside tile or
  edge intersection).
- `countTilesForPolygon(...)`: same, count only (used for the live estimate).
- `estimateSize({ tilesCount, layer })`: tiles × average tile size of the layer.
- `formatTileUrl(template, {x, y, z})`.

## Data / services

- `src/model/OfflineMapArea.ts`: `{ id, name, layerId, coordinates, minZoom,
  maxZoom, tilesCount, downloadedTilesCount, failedTilesCount, sizeBytes,
  dateCreated, dateModified }`.
- `src/service/offlineMaps/offlineMapAreaRepository.ts`: areas metadata stored
  in AsyncStorage (`@offlineMapAreas`).
- `src/service/offlineMaps/OfflineMapAreaDownloadJob.ts`: `JobMobile` that
  downloads the tiles (skips the ones already present, concurrency 4, reports
  progress, supports cancel) and stores the area with its size; run through
  `JobMonitorActions.startAsync` so the existing progress dialog (with cancel)
  is used.
- `src/service/offlineMaps/offlineMapsService.ts`: tile folders, fetch areas,
  download area, delete area (deletes only tiles not used by other areas of the
  same layer), storage used per layer / total, delete all.
- Full backup excludes the `map_tiles` folder (it can be re-downloaded and would
  make backups huge).

## UI

### `MapView` (components)
- Reads `mapProvider`/`mapLayer` from settings.
- Free provider: `mapType="none"`, renders `<UrlTile>` with `tileCachePath`,
  `offlineMode` (from network status), `tileCacheMaxAge`, attribution text,
  and an "offline" badge when not connected.

### `GeoPolygonEditor` improvements
- `onCoordinatesChange` callback (live polygon while drawing/editing).
- `headerContent` slot rendered above the map (used by the area editor to show
  name, layer, zoom and estimate).
- `saveButtonTextKey`/`saveButtonIcon` props (e.g. "Download").
- `extraOverlays` to show already downloaded areas as reference.
- It automatically benefits from the free/offline layers through `MapView`.

### Screens
- **Offline maps** (`screenKeys.offlineMaps`): total used space, free disk
  space, list of areas (name, layer, zoom range, tiles, size, date, incomplete
  warning) with *delete* and *update (re-download missing tiles)*; *Add area*
  button; *Delete all*. Reachable from Settings and from the options menu.
- **Offline map area editor** (`screenKeys.offlineMapAreaEditor`): full screen
  `GeoPolygonEditor`; header with name, layer (satellite/topographic segmented
  buttons), max zoom slider, and live estimate
  `N tiles · ~X MB (free: Y GB)`; warnings when over the tile limit or over the
  free space; *Download* starts the job, then goes back to the list.

### Localization
English strings in new `offlineMaps` namespace + settings keys; other
languages fall back to English.

## Testing

- Jest unit tests for `MapTileUtils` (tile coordinates, polygon coverage,
  counts, URL templating).
- `yarn test:types`, `yarn lint`, `yarn test`.
- Manual testing on device (not possible in CI): draw area, download, switch
  on airplane mode, open a `geo` attribute and check the tiles are shown.

## Future work

- Custom tile URL layer (own/licensed tile server, e.g. MapTiler with key).
- Optional MapLibre engine behind the same `MapView` API (vector tiles).
- Show downloaded areas' outlines while drawing a `geo` attribute.
- Pre-fetch the area of a survey automatically from the survey extent.

## Implementation status

Implemented in this branch:

- [x] `MapLayers` / `OfflineMapArea` model, `mapProvider` + `mapLayer` settings (new *Maps* group).
- [x] `MapTileUtils` (tile math, polygon coverage, count/estimate) with Jest tests.
- [x] `MapView`: free layers through `UrlTile` + tile cache + offline mode, attribution, offline badge, layer switching.
- [x] `GeoPolygonEditor`: `onCoordinatesChange`, `headerContent`, `extraOverlays`, `layerId`, custom save button.
- [x] Offline areas repository, download job (throttled, resumable, cancelable), service (estimate, delete, delete all, storage size).
- [x] *Offline maps* screen (settings + options menu) and *area editor* screen with live estimate.
- [x] Full backup excludes the map tiles folder.
- [x] English strings (other languages fall back to English).

Still to do: manual testing on Android/iOS devices, translations.
