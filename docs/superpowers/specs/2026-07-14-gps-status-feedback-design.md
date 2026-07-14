# GPS status feedback design

Date: 2026-07-14

## Problem

Pressing "Get location" when an external GPS device is in play gives no feedback
while the app is busy:

- Connecting to an external GPS device over Bluetooth Classic has real latency
  (device wake-up, first NMEA fix) before `watchingLocation` ever flips to
  `true`. Until then `LocationWatchingMonitor` still shows the idle
  "Get location" / "GPS source" row, so a slow or failing device connect looks
  like a dead button.
- There is no way to tell, while watching, whether the location currently
  being read is coming from the external device or from a same-session
  fallback to the internal GPS.
- If an external device is paired but a connection attempt to it fails,
  today's only feedback is a transient toast
  (`device:externalGps.unavailable.warning`) that's easy to miss.
- The GPS-source menu (`useAvailableGpsSources`) refreshes its list
  asynchronously with no loading indicator, so it can briefly show an
  incomplete list right after the screen gains focus.

## Scope

Feedback is shown as a status line in `LocationWatchingMonitor`, below/around
the existing "Get location" / "GPS source" button row, plus a small loading
affordance on the GPS-source menu button. No other screens are touched.

Out of scope: actually aborting an in-flight Bluetooth socket handshake
(cancellation is implemented as "let it finish, then immediately release" —
see Error handling below), and any change to the connection pooling/ref-count
logic in `ExternalGpsConnectionManager`.

## State machine (`src/hooks/useLocationWatch.ts`)

Replace the implicit binary state with an explicit status, keeping
`watchingLocation` as a value derived from it so every existing consumer
(`NodeCoordinateComponent`'s input-disabling, delete-button visibility, etc.)
is unaffected:

```ts
type LocationWatchStatus = 'idle' | 'connecting' | 'watching';
// watchingLocation = status !== 'idle'
```

New fields returned by the hook:

- `locationWatchStatus: LocationWatchStatus`
- `connectingSourceId?: string` — set as soon as the hook decides to attempt
  an external connect (before the Bluetooth permission prompt and before the
  actual handshake). Deliberately **not** cleared when the attempt settles
  (success or fallback) — while `watching` with `locationSourceUnavailable`,
  it still holds the external source id that failed, which the UI needs to
  render "Using internal GPS (`<device>` unavailable)". It's only reset by
  `cancelConnecting()` or overwritten by the next `startLocationWatch()` call.
- `activeLocationSourceId` (existing) — which source is live while `watching`.
- `locationSourceUnavailable` (existing) — true when this session's `watching`
  state is the result of a fallback from external to internal GPS.
- `cancelConnecting()` — new; only meaningful while `status === 'connecting'`.

### `startLocationWatch` changes

As soon as the resolved source requires an external connect
(`useExternalSource === true`), set `status: 'connecting'` and
`connectingSourceId: resolvedSourceId` — **before** requesting the Bluetooth
permission and before calling `ExternalGpsService.watchPosition()` — so
feedback appears even if the permission dialog itself is what's slow.

For a plain internal-GPS start (`useExternalSource === false`), skip the
visible connecting phase and go straight to `watching`, same as today.

### `cancelConnecting()`

1. Sets a `cancelRequestedRef.current = true`.
2. Immediately resets state to `idle` (instant UI feedback — the button row
   reappears right away).
3. When the in-flight `ExternalGpsService.watchPosition()` promise later
   settles:
   - If it succeeded and the cancel flag is set, immediately call the
     returned `remove()` (the same teardown path a normal Stop uses, which
     releases the pooled Bluetooth connection) instead of transitioning to
     `watching`.
   - If it failed, nothing further happens — state is already `idle`.

## `LocationWatchingMonitor.tsx` rendering

No line is shown at all when there is nothing external-GPS-related to
report (no paired external device involved in this attempt) — identical to
today's behavior for the plain-internal-GPS majority case.

| Situation | UI |
|---|---|
| `connecting`, external | Idle row is replaced by: `Connecting to <label>…` + a `Cancel` button (calls `cancelConnecting()`) |
| `watching`, external, connected | Existing accuracy/progress UI **plus** a persistent line `Using <label>` for the whole watch session |
| `watching`, fell back to internal this session (`locationSourceUnavailable`) | Existing accuracy/progress UI **plus** `Using internal GPS (<label> unavailable)` |
| `watching`/`idle`, no external device relevant | Unchanged, no extra line |

`<label>` is looked up from `availableGpsSources` (already passed into the
component) by `connectingSourceId` / `activeLocationSourceId`. If not found
(e.g. the device was unpaired mid-session), fall back to a generic
"external GPS device" string.

The existing toast `device:externalGps.unavailable.warning` is **removed**:
the persistent fallback line covers the same information without
disappearing, so keeping both would be redundant.

## GPS source list loading (`src/hooks/useAvailableGpsSources.ts`)

Add a `loading` boolean, `true` initially and for the duration of any
`refreshAvailableGpsSources()` call. `LocationWatchingMonitor` shows a small
spinner in place of the GPS-source menu button's icon while `loading` is
true, and disables the button meanwhile, so the menu can never be opened
against an incomplete list.

## Localization

New keys under `dataEntry.coordinate` (English source; other locales left
for translators):

- `connectingToSource` → `"Connecting to {{label}}…"`
- `usingSource` → `"Using {{label}}"`
- `usingInternalFallback` → `"Using internal GPS ({{label}} unavailable)"`

Reuse the existing `common:cancel` key for the Cancel button.

The existing `device:externalGps.unavailable.warning` key becomes unused and
is removed along with its toast call site.

## Error handling / edge cases

- Cancelling during `connecting` is always safe: if the connect succeeds
  anyway after cancellation, the connection is released immediately via the
  normal teardown path — no orphaned Bluetooth connection lingers in
  `ExternalGpsConnectionManager`'s pool.
- If cancel happens and the connect then fails anyway, nothing else happens;
  state is already back to `idle`.
- The existing internal-GPS-permission-denied path
  (`toaster("device:locationServiceDisabled.warning")`) is untouched — a
  separate, already-handled case.

## Testing

No automated test suite exists for this project (manual device testing per
`CLAUDE.md`). Verification will be manual, on a device with an external GPS
paired:

- Get location with external device reachable: connecting line → persistent
  "Using `<device>`" line while watching.
- Get location with external device unreachable/out of range: connecting
  line → falls back → "Using internal GPS (`<device>` unavailable)" line.
- Cancel while connecting: row returns to idle immediately; no lingering
  Bluetooth connection (verify via logs — `ExternalGps: closed idle
  connection to <id>` should still eventually fire if a stray connection came
  up, or nothing GPS-related logs at all if cancel beat the connect).
- No external device paired: behavior is pixel-identical to today (no status
  line, no source label ever needed).
- GPS-source menu spinner shows briefly right after navigating into the
  screen, then resolves to the normal menu.
