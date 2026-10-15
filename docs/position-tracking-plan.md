# Position tracking (GPS track) – implementation plan

Branch: `claude/feat-position-tracking-boma8t`

## Goal

While filling in a record, the user can **record the path they are walking**
(e.g. the route to a plot, the perimeter walked around a stand, a transect).

- Tracking is started from the record (e.g. right after creating it).
- The tracking status is **always visible** while editing the record, in a thin
  bar that can be **expanded** to show details and **Pause / Resume / Stop**
  buttons.
- The track is stored in a **`geo` attribute** of the survey, marked in Arena
  with a boolean prop that enables position tracking for it. The value is a
  GeoJSON geometry, so it is synced/exported like any other geo value.

## Survey definition (Arena + arena-core)

### New node def prop

`geo` attributes get a new boolean prop, e.g. `positionTracking` (name to be
agreed with the Arena web team):

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

**To verify with Arena (server side):** that geo values other than `Polygon`
are accepted by validation, data export (CSV/GeoJSON), the Arena map and the
data explorer. If Arena only supports polygons today, server-side support is a
prerequisite (or a parallel task).

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
  stop, leaving the record, app going to background, and periodically
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

- Tracking is bound to one record/node. Opening another record while tracking
  → confirm "Stop tracking in record X?".
- Leaving the record editor → confirm: **Pause** (default) / Stop / Cancel.
  (Continuing to track outside the record is phase 2 together with background
  tracking.)
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
  fix time, and buttons **Pause / Resume**, **Stop**, **Go to attribute**
  (navigates to the node, where the track is shown on a map).
- Stop asks for confirmation; Pause does not.
- When several trackable nodes are available (root + current entity), "Start"
  opens a small chooser.

### Geo attribute (`NodeGeoComponent`)

When the node def has `positionTracking`, render a track view instead of the
polygon editor:

- map with the track as `Polyline`s (one per segment) and the current position;
- length / points / duration summary;
- Start / Pause / Resume / Stop buttons (same thunks as the bar);
- "Clear" (confirm) and the existing "Download GeoJSON".
- `NodeGeoValuePreview` shows length + points count for `MultiLineString` /
  `LineString` values.

`GeoUtils` gets helpers for line strings: extract coordinates, compute length,
compute region (reuse `computeRegionFromCoordinates`).

### Settings (`SettingsScreen`, "Position tracking" section)

- min distance between points (m), default 3;
- accuracy threshold for track points (m), default 20;
- flush interval (s), default 60 (maybe hidden/advanced);
- phase 2: "Continue tracking in background".

### Localization

New keys in `src/localization/en/dataEntry.json` (and `settings.json`):
`positionTracking.start|pause|resume|stop|stopConfirm|tracking|paused|
waitingForFix|permissionDenied|locationServicesOff|interrupted|...`; other
languages fall back to English until translated.

## Background tracking (phase 2)

Phase 1 tracks only while the app is in the foreground (screen on – keep-awake
helps). Real field use will need background tracking:

- `expo-task-manager` + `Location.startLocationUpdatesAsync` with an Android
  **foreground service** (persistent notification "Arena Mobile is recording
  your track", with stop action), `ACCESS_BACKGROUND_LOCATION`,
  `FOREGROUND_SERVICE_LOCATION`; iOS `UIBackgroundModes: ["location"]`,
  `NSLocationAlwaysAndWhenInUseUsageDescription`. Config changes in
  `app.config.ts` + prebuild.
- The background task writes points straight into SQLite (no Redux available);
  the UI re-reads stats when the app returns to the foreground.
- Store policy: Google Play requires a background-location declaration and
  video; App Store review needs a clear justification. This is the main reason
  to ship it separately.
- External Bluetooth GPS in background: to be evaluated (Classic SPP
  connection lifetime when the app is backgrounded).

## Testing

- Jest: `trackUtils` (filtering, length, segment building, GeoJSON
  serialization, append on resume), reducer/selectors, flush logic with a
  mocked repository, migration `003` on an in-memory DB if available.
- Maestro: start → pause → resume → stop flow on the demo survey (needs a
  trackable geo attribute in `demoSurvey.json`); feed positions with
  `adb emu geo fix` on the Android emulator.
- Manual: walking test on Android and iOS with internal and external GPS,
  screen off/on, app killed during tracking (recovery), low battery.

## Implementation steps

1. arena-core: `NodeDefGeoProps.positionTracking` + `NodeDefs.isPositionTracking`;
   Arena web checkbox; confirm server support for line geometries.
2. Mobile model helper + `GeoUtils` line helpers + `trackUtils` with tests.
3. DB migration `003` + `positionTrackRepository`.
4. `PositionTrackingService` (internal GPS first, then external GPS source).
5. Redux slice + thunks (start/pause/resume/stop/flush/recover).
6. `PositionTrackingBar` in `RecordEditor`.
7. `NodeGeoComponent` track view + `NodeGeoValuePreview`.
8. Record lifecycle hooks (leave record, open other record, delete node,
   app background, `AppInitializer` recovery).
9. Settings section + localization.
10. Demo survey trackable attribute + Maestro flow.
11. Phase 2: background tracking.

## Open questions

- Prop name and placement in Arena (`positionTracking` on geo vs. a dedicated
  "track" geometry type).
- Does Arena accept/export/display `MultiLineString` geo values? Should
  per-point times/accuracies be kept (value size: ~1 h at 1 point/3 m ≈ 1–2k
  points ≈ 100–200 KB of JSON) or dropped/simplified (Douglas–Peucker) on stop?
- Should tracking start automatically when a record is created if the survey
  has a trackable attribute in the root entity (survey-level option)?
- Allow more than one active track (e.g. root + plot) at the same time? Plan
  assumes no.
- Show the current record's track in `RecordsMapScreen` too?
