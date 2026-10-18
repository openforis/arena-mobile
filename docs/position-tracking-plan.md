# Position tracking (GPS track) – implementation plan

Branch: `claude/feat-position-tracking-boma8t`

## Goal

While filling in a record, the user can **record the path they are walking**
(e.g. the route to a plot, the perimeter walked around a stand, a transect).

- Tracking **starts automatically when a new record is created** and the
  survey has a geo attribute with tracking enabled; it can also be started
  manually.
- The tracking status is **always visible** while editing the record, in a thin
  bar that can be **expanded** to show details and **Pause / Resume / Stop**
  buttons.
- The track is stored in a **`geo` attribute** of the survey, marked in Arena
  with a boolean prop that enables position tracking for it. The value is a
  GeoJSON geometry, so it is synced/exported like any other geo value.

## Survey definition (Arena + arena-core)

### New node def prop

`geo` attributes get a new boolean prop `positionTracking`:

```ts
// arena-core: nodeDef/types/geo.ts (new – geo has no typed props yet)
export interface NodeDefGeoProps extends NodeDefProps {
  positionTracking?: boolean
}
export type NodeDefGeo = NodeDef<NodeDefType.geo, NodeDefGeoProps>

// NodeDefs
const isPositionTracking = (nodeDef: NodeDefGeo): boolean => Boolean(nodeDef.props.positionTracking)
```

Arena web: a checkbox "Position tracking" in the geo attribute editor. While
arena-core is not released, mobile reads `nodeDef.props.positionTracking`
directly through a small helper in `src/model/` (removed once core has it).

Constraints (validated in Arena, enforced defensively in mobile):

- the attribute must be **single** (not multiple);
- read-only / calculated (`defaultValue` with `readOnly`) attributes are not trackable;
- in the mobile app a tracking-enabled attribute is **not editable**: no
  polygon drawing, no manual input, no clear; its value is written only by
  position tracking.
- it can live in the root entity (one track per record) or in a multiple
  entity (one track per entity instance, e.g. per plot).

### Stored value

A GeoJSON `Feature` whose geometry is a **`MultiLineString`**: each
start/resume → pause/stop interval is one line, so pauses don't draw a
straight segment across the gap.

```json
{
  "type": "Feature",
  "properties": {
    "startTime": "2026-10-15T08:12:03Z",
    "endTime": "2026-10-15T09:40:51Z",
    "length": 2483.4,
    "pointsCount": 912,
    "coordTimes": [["2026-10-15T08:12:03Z", "..."], ["..."]],
    "accuracies": [[3.9, 4.1], [4.0]]
  },
  "geometry": {
    "type": "MultiLineString",
    "coordinates": [[[12.49, 41.89, 25.1], [12.4902, 41.8901, 25.3]], [[...]]]
  }
}
```

- coordinates in WGS84 `[lon, lat, alt?]` (same as the polygon value);
- per-point times/accuracy go in `properties` as arrays parallel to the
  coordinates (the `coordTimes` convention used by togeojson/GPX converters),
  so the geometry stays standard GeoJSON.

Arena (server) supports line geometries too, so the value is synced,
validated and exported as is. Per-point times/accuracies are kept and the
track is not simplified: ~1 h of tracking (1–2k points) is ~100–200 KB of
JSON, which is acceptable.

## Architecture (mobile)

```
expo-location / ExternalGpsService ──► PositionTrackingService (singleton)
                                           │  filter + buffer points
                                           ├──► SQLite `position_track_point` (crash-safe buffer)
                                           ├──► Redux `positionTracking` slice (status, stats)
                                           └──► flush ─► DataEntryActions.updateAttribute(track node)
UI: PositionTrackingBar (record editor)   NodeGeoComponent (track view)   Settings
```

### 1. `PositionTrackingService` (`src/service/positionTracking/`)

Module-level singleton (like the GPS locking subscription in
`state/settings/actions.ts`), **not** tied to a component lifecycle, so it keeps
running while the user moves between pages/nodes of the record.

- `start({ surveyId, recordUuid, nodeUuid })`, `pause()`, `resume()`, `stop()`.
- Location source: internal GPS via `Location.watchPositionAsync`
  (`Accuracy.BestForNavigation`, `distanceInterval` from settings); when an
  external Bluetooth GPS is the preferred/connected source, subscribe to
  `ExternalGpsService` instead (same source selection rules as
  `useLocationWatch`; extract the shared part rather than duplicating it).
- Point filter (pure functions, unit-tested in `trackUtils.ts`):
  - drop fixes with accuracy worse than the tracking threshold (setting);
  - drop fixes closer than the min distance to the last kept point (setting,
    default ~3 m) unless the min time interval elapsed;
  - drop obvious jumps (implied speed > ~50 m/s).
- Stats: length (haversine, per segment), elapsed active time, points count,
  last accuracy, time since last fix (to show "waiting for GPS").
- Keep the screen awake while tracking (`SystemUtils` keep-awake), restoring
  the user setting on stop.

### 2. Persistence and flushing

Writing the node on every fix would re-validate the record and mark it
modified each second, so points are buffered:

- **DB migration `003`**: table `position_track_point (id, survey_id,
  record_uuid, node_uuid, segment_index, time, lat, lon, alt, accuracy)`
  plus a small `position_track (record_uuid, node_uuid, status, ...)` row for
  the active session. Points are inserted as they arrive (cheap, crash-safe).
- **Flush** to the attribute (`DataEntryActions.updateAttribute`) on: pause,
  stop, leaving the record, app going to background (tracking pauses there,
  see "Out of scope"), and periodically
  (every ~60 s while tracking) so the record always holds an almost-current
  track. The flushed value is built from the buffer + the existing node value
  (resuming tracking on a node with a value **appends** a new segment).
- On stop the buffer rows of that node are deleted.
- On app start (`AppInitializer`), an unfinished session is detected: its
  buffer is flushed into the record and the user is told tracking was
  interrupted (offered to resume when they reopen the record).
- Auto-sync: the record becomes "modified" only on flush, so auto-sync uploads
  at most once per flush interval.

### 3. Redux slice `positionTracking` (`src/state/positionTracking/`)

`status: "idle" | "starting" | "tracking" | "paused" | "error"`,
`recordUuid`, `nodeUuid`, `nodeDefUuid`, `startedAt`, `elapsedTime`,
`length`, `pointsCount`, `lastAccuracy`, `lastFixTime`, `errorKey`
(permission denied, location services off, no fix). Thunks wrap the service;
selectors + `use*` hooks as in the other slices. Only **one** active tracking
in the whole app.

### 4. Record lifecycle rules

- **Auto-start on record creation**: at the end of
  `DataEntryActions.createNewRecord` (after the record is created and saved,
  before navigating to the editor), look for a geo attribute with
  `positionTracking` among the nodes created with the record (root entity and
  its single entities). If found, dispatch `startPositionTracking` for that
  node. The location permission is requested at that moment; if denied or
  location services are off, the bar shows the error with a "Retry" action and
  the record is created anyway. Trackable attributes inside multiple entities
  are started manually (no auto-start when an entity instance is added).
- The user stops (or pauses) tracking from the status bar.
- Tracking is bound to one record/node. Opening another record while tracking
  → confirm "Stop tracking in record X?".
- Leaving the record editor (after the usual "go to list of records"
  confirmation) stops tracking and saves the track into the attribute.
  Tracking never continues outside the record editor; when the record is
  opened again, "Resume" appends a new segment to the saved track.
- App sent to background / screen locked → tracking pauses automatically
  (points flushed); when the app comes back to the foreground with the same
  record open, the bar offers **Resume** (a new segment is started).
- Deleting the tracked node/entity or the record → stop and discard.
- Record not editable (read-only, sync in progress, other cycle) → no start
  buttons.

## UI

### Tracking status bar (`src/screens/RecordEditor/PositionTrackingBar/`)

Placement: **top of the record editor content, right below the AppBar /
breadcrumbs** (above the auto-sync banner). The bottom area already holds the
collapsible `StatusBar` and the `BottomNavigationBar`, and is covered by the
keyboard while typing; the top stays visible. (Easy to move: it is a single
component rendered in `RecordEditor.tsx`.)

- **Collapsed** (one line, ~28 dp, coloured background): pulsing red dot when
  tracking / pause icon when paused / warning icon on error, then
  `1.24 km · 00:42:10 · ±4 m`. When idle and the record has a trackable
  attribute without a value, it shows a compact "Start tracking" action
  instead (hidden if the survey has no trackable attribute).
- **Expanded** (tap; reuse `CollapsiblePanel`): attribute label (+ parent
  entity keys when inside a multiple entity), start time, points count, last
  fix time, and buttons **Pause / Resume**, **Stop**, **Show track**
  (navigates to the node, where the track is shown on a map).
- Stop asks for confirmation; Pause does not.
- When several trackable nodes are available (root + current entity), "Start"
  opens a small chooser.

### Geo attribute (`NodeGeoComponent`)

When the node def has `positionTracking`, render a **read-only** track view
instead of the polygon editor (the drawing/edit/clear actions are not
rendered and `useNodeGeoComponent` refuses to save a manual value):

- map with the track as `Polyline`s (one per segment) and the current position;
- length / points / duration summary;
- Start / Pause / Resume / Stop buttons (same thunks as the bar) - the only
  way to change the value;
- the existing "Download GeoJSON".
- on a node that already has a track (after Stop, or when the record is opened
  again) the button is "Resume": it appends a new segment, the recorded points
  are never discarded silently;
- "Restart" deletes the recorded track and starts a new one, after a
  swipe-to-confirm warning that the points will be lost.
- `NodeGeoValuePreview` shows length + points count for `MultiLineString` /
  `LineString` values.

`GeoUtils` gets helpers for line strings: extract coordinates, compute length,
compute region (reuse `computeRegionFromCoordinates`).

### Records map (`src/screens/RecordsMap/`)

Today the map has point layers only (`samplingPoints`, `coordinateAttribute`).
Add a layer type `positionTrack`, one layer per tracking-enabled geo
attribute def, listed in `RecordsMapLayersPanel` like the coordinate
attribute layers (own colour, toggle, label from the attribute def).

- `recordsMapLayers.ts`: `getAvailableLayers` adds the track layers; a
  `createTrackFeatures` helper turns node values into `MultiLineString`
  features with the record label / uuid in `properties` (unit-tested in
  `recordsMapLayers.test.ts`).
- Data: values loaded with the existing
  `RecordService.fetchNodeValuesByDefUuids` (track def uuids added to the
  list). Tracks are larger than points: only the visible track layers are
  loaded (lazy load on toggle), hidden by default.
- Rendering: `Polyline`s (not clustered, so drawn outside
  `useRecordsMapClusters`); tapping a track selects its record in
  `RecordsMapSelectionPanel` (open record, etc.), like a point.
- Tracks contribute their bounds to the initial map region.
- The layer type is named for tracks but the code path (line/polygon
  features from geo values) is kept generic, so plain geo (polygon) layers can
  be added later with little work.

### Settings (`SettingsScreen`, "Position tracking" section)

- min distance between points (m), default 3;
- accuracy threshold for track points (m), default 20;
- flush interval: fixed to 60 s (not a setting).

### Localization

New keys in `src/localization/en/dataEntry.json` (and `settings.json`):
`positionTracking.start|pause|resume|stop|stopConfirm|tracking|paused|
waitingForFix|permissionDenied|locationServicesOff|interrupted|...`; other
languages fall back to English until translated.

## Out of scope: background tracking

Tracking runs only while the app is in the foreground with the record open
(keep-awake prevents the screen from turning off). Background tracking
(`expo-task-manager`, Android foreground service, "always" location
permission, store reviews) is not planned for now; the service API is kept
independent of React so it can be added later without UI changes.

## Testing

- Jest: `trackUtils` (filtering, length, segment building, GeoJSON
  serialization, append on resume), reducer/selectors, flush logic with a
  mocked repository, migration `003` on an in-memory DB if available.
- Maestro: create record → tracking auto-starts → pause → resume → stop flow
  on the demo survey (needs a trackable geo attribute in `demoSurvey.json`);
  feed positions with `adb emu geo fix` on the Android emulator.
- Manual: walking test on Android and iOS with internal and external GPS,
  screen off/on, app killed during tracking (recovery), low battery.

## Implementation status

Implemented in this branch:

- `model/utils/PositionTracks.ts`: node def helpers (`isPositionTrackingNodeDef`,
  `findAutoStartNode`), point filter, GeoJSON (MultiLineString) conversion,
  length/duration helpers. `isPositionTrackingNodeDef` uses
  `NodeDefs.isPositionTracking` (arena-core 2.8.0).
- DB migration `003` (`position_track`, `position_track_point`) and
  `positionTrackRepository`.
- `service/positionTracking`: location source (internal GPS or external GPS
  with fallback to internal when "auto") and `PositionTrackingService`.
- Redux slice `positionTracking` with thunks: start, auto-start on record
  creation, pause, resume, stop, periodic flush (60 s), close on leaving the
  record, recovery when opening a record with an unsaved track, cleanup on
  records deletion.
- `PositionTrackingBar` at the top of the record editor; tracking pauses when
  the app goes to background.
- Read-only track view in tracking-enabled geo attributes; track preview in
  `NodeGeoValuePreview`.
- Settings: min distance and accuracy threshold (Location & GPS group).
- Records map: `positionTrack` layers (lazy-loaded, hidden by default).
- English texts (other languages fall back to English).

Deviations from the plan:

- Leaving the record stops (and saves) the track instead of pausing it.
- "Show track" in the bar opens the attribute in a dialog instead of
  navigating to its page.
- Re-opening a record never starts tracking automatically: the bar shows a
  "Start" button for the trackable attribute in the root entity (or its single
  entities), also when it already has a track (a new segment is added); other
  trackable attributes are started from the attribute itself.

Still to do:

- Arena web checkbox (experimental): openforis/arena#4549 (arena-core prop
  merged in openforis/arena-core#481, released in 2.8.0).
- Trackable attribute in the demo survey + Maestro flow.
- Translations.
- Manual tests on devices (internal and external GPS, app killed while
  tracking).

## Implementation steps

1. arena-core: `NodeDefGeoProps.positionTracking` + `NodeDefs.isPositionTracking`;
   Arena web checkbox.
2. Mobile model helper + `GeoUtils` line helpers + `trackUtils` with tests.
3. DB migration `003` + `positionTrackRepository`.
4. `PositionTrackingService` (internal GPS first, then external GPS source).
5. Redux slice + thunks (start/pause/resume/stop/flush/recover).
6. `PositionTrackingBar` in `RecordEditor`.
7. `NodeGeoComponent` read-only track view + `NodeGeoValuePreview`.
8. Record lifecycle hooks (auto-start in `createNewRecord`, leave record,
   open other record, delete node, app background, `AppInitializer` recovery).
9. Settings section + localization.
10. Demo survey trackable attribute + Maestro flow.
11. Records map: `positionTrack` layers.

## Decisions

- Prop: `positionTracking` (boolean) on geo attributes. When true the
  attribute is not editable in the mobile app; only tracking writes it.
- Records map: tracks shown as additional layers (one per trackable geo
  attribute).
- Background tracking: out of scope for now.
- Arena supports line geometries: value stored as `MultiLineString` Feature.
- Track size (~200 KB/h of JSON) is fine: per-point times/accuracies kept, no
  simplification.
- Tracking auto-starts when a record is created and a trackable geo attribute
  is found; the user stops it from the status bar.
- Only **one** active track at a time, and only in the record currently
  open in the editor. Starting tracking on another node stops the current one
  (after confirmation); if the root entity holds more than one trackable
  attribute, auto-start picks the first one in survey order.
