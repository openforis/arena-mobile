# Position tracking – test and completion plan

Branch: `claude/feat-position-tracking-boma8t` (PR #256). Feature design:
`docs/position-tracking-plan.md`.

What is left before the feature can be released:

1. manual tests on devices (no automated test covers real GPS behaviour);
2. a tracking attribute in the demo survey + a Maestro flow;
3. translations.

## 1. Manual tests on devices

### Setup

- Survey published from Arena (with `EXPERIMENTAL_FEATURES` enabled, to see
  the checkbox) with:
  - `track`: single geo attribute in the root entity, "Position tracking"
    checked (auto-start);
  - `plot_track`: single geo attribute in a multiple entity `plot`,
    "Position tracking" checked (manual start);
  - a normal geo attribute (polygon) to check it's unaffected.
- Devices: one Android (recent + one old/low-end if possible), one iPhone.
- External GPS: a paired Bad Elf (or the receiver in use), with GPS source
  "auto".
- Settings: defaults (min distance 3 m, accuracy 20 m), then repeat a walk
  with 10 m / 10 m to compare.

### Cases

Each case: expected result in brackets; note device, OS, GPS source.

**Start / stop**

1. Create a record → tracking starts (bar: "Tracking", red dot); location
   permission asked the first time.
2. Deny the permission → record created anyway, bar shows the error and
   "Retry"; grant from system settings, Retry → tracking starts.
3. Location services off → specific error message; turn them on, Retry.
4. Walk ~10 min outdoors → length/duration/accuracy update; "Waiting for
   GPS…" only when no fix for > 10 s (e.g. indoors).
5. Stop from the bar → confirmation; track saved in `track` (open the
   attribute: map with the line, summary).
6. Start again from the bar → a new segment is added (2 lines on the map, no
   straight line across the gap).

**Pause / resume**

7. Pause → no points while walking; Resume → new segment.
8. App to background (home button) for 2 min → paused, track saved; back to
   foreground → bar shows Resume.
9. Lock the screen while tracking → same as 8 (screen should not lock by
   itself while tracking: keep-awake).

**Record lifecycle**

10. Leave the record (go to the list of records) while tracking → track
    saved, tracking stopped; re-open the record → no auto-start, bar shows
    "Start tracking".
11. Kill the app while tracking (swipe away) → reopen the app and the record
    → message "Position tracking was interrupted…", track contains the
    points recorded before the kill, bar shows Resume.
12. Delete the record while it has an interrupted track → no error;
    re-create a record → tracking works.
13. `plot_track`: add a plot, start tracking from the attribute → confirm
    asks to stop the root track first; both tracks saved correctly.
14. Delete the plot being tracked → tracking stops without errors.

**Attribute and data**

15. Tracking attribute is read-only: no draw/edit/clear buttons; GeoJSON
    download works and the file opens in QGIS (MultiLineString, times and
    accuracies in properties).
16. Normal geo attribute: polygon drawing unchanged.
17. Sync/upload the record to Arena → the track is visible in Arena (data
    view / map) and export contains it.
18. Auto-sync on: while tracking, the record is uploaded at most once per
    flush (every ~60 s), not on every point.

**GPS sources**

19. External GPS with "auto" → points come from the receiver (better
    accuracy shown); switch it off while tracking → falls back to the
    internal GPS without stopping.
20. GPS source "internal" with the receiver on → internal GPS used.

**Records map**

21. Track layer listed per tracking attribute, hidden by default; enable →
    tracks drawn with the layer colour, "N tracks" count shown; tap a track →
    record selected, "Open" opens it.

**Battery and size**

22. 1 h walk: note battery drop and the size of the track (attribute value);
    expected ~1–2k points, ~100–200 KB.

### Recording results

Add a table to the PR (case number, Android result, iOS result, notes) and
open an issue for each failure.

## 2. Demo survey and Maestro flow

### Demo survey

Adding a tracking attribute to the root entity of the bundled demo survey
would auto-start tracking in every demo flow (005–009). Instead:

- add `track` (single geo attribute, `positionTracking: true`) to the
  `unit_level_2` multiple entity in Arena, re-export the demo survey and
  update `src/service/demoSurvey.json` (and `demoSurvey.test.ts` if it checks
  the node defs);
- auto-start is not triggered (multiple entity), the existing flows are not
  affected.

### Maestro flow `010.demo-survey-position-tracking.yaml`

Location permission is already granted (`adb install -g`); positions are fed
with `setLocation`.

1. `runFlow: common/demo-survey-new-record.yaml`; open the `unit_level_2`
   page, add an entity.
2. `setLocation` (start point); tap "Start tracking" on the `track`
   attribute; assert the bar shows "Tracking".
3. 4–5 `setLocation` steps ~20 m apart (with short waits) → assert the bar
   shows a length > 0.
4. Tap the bar, "Pause" → assert "Tracking paused"; "Resume"; one more
   `setLocation`.
5. "Stop" → confirm → assert the attribute shows the track summary
   ("… points").
6. Go to the list of records → re-open the record → assert no "Tracking"
   status (no auto-start).

Add it to `allTests.yaml` and `demoSurveyTests.yaml`. Add `testID`s to the bar
and its buttons if text matching is fragile.

## 3. Translations

New keys (English only for now):

- `dataEntry.positionTracking.*`
- `settings.positionTrackingAccuracyThreshold`,
  `settings.positionTrackingMinDistance`
- `recordsMap.tracksCount`, updated `recordsMap.noLayers`

Add them to the other languages (`src/localization/{am,de,es,fa,fi,fr,id,ja,pt,ru,sv}`)
the same way other features were translated, then have native speakers
review es/fr/pt at least.

## Order

1. Manual tests (blocking: fix what they find in this PR).
2. Demo survey + Maestro flow (can be a follow-up PR if the release is
   urgent).
3. Translations (follow-up PR).
