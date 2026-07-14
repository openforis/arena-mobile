# GPS Status Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show status-line feedback in `LocationWatchingMonitor` while connecting to an external GPS device, while it's actively in use, and when a session falls back from external to internal GPS — plus a loading affordance on the GPS-source menu.

**Architecture:** Extend `useLocationWatch`'s internal state from an implicit boolean to an explicit `idle | connecting | watching` status machine (with a cancellable in-flight connect), thread the new fields through `useNodeCoordinateComponent` → `NodeCoordinateComponent` → `LocationWatchingMonitor`, and render three new status-line variants there. Add a `loading` flag to `useAvailableGpsSources` for the source-menu spinner. Remove the now-redundant fallback toast and its locale key.

**Tech Stack:** React Native / Expo, TypeScript, React Native Paper (`Button`, `ActivityIndicator` via `LoadingIcon`), i18next (`localization` module, `useTranslation`).

## Global Constraints

- This project has **no automated test suite** (per `CLAUDE.md`: "Testing is done manually on devices"). Every task's verification step is `yarn test:types` (TypeScript) + `yarn lint` (ESLint, auto-fix) instead of a test runner, plus a manual verification description. Do not add a test framework as part of this plan.
- Follow the codebase's existing alphabetical ordering of object/destructure keys (observed throughout the touched files) when adding new fields.
- No new dependencies. Reuse existing components (`Button`, `LoadingIcon`, `Text`, `MenuButton`) and the existing `common:cancel` localization key.
- New i18next keys are added to `src/localization/en/dataEntry.ts` **only** — `fallbackLng` is `"en"` (`src/localization/i18n.ts:23,58`), so other locales fall back automatically; do not hand-translate placeholders into other locale files.
- Never modify database migrations or unrelated files — this feature touches only the files listed per task below.

---

### Task 1: `useLocationWatch` connecting/cancel state machine

**Files:**
- Modify: `src/hooks/useLocationWatch.ts`
- Modify: `src/hooks/index.ts`

**Interfaces:**
- Consumes: nothing new (self-contained hook change).
- Produces (new return fields other tasks rely on):
  - `locationWatchStatus: "idle" | "connecting" | "watching"` — the `LocationWatchStatus` type is exported from `useLocationWatch.ts` and re-exported from `hooks/index.ts`, so Task 3 imports it (`import type { LocationWatchStatus } from "hooks";`) rather than redefining it.
  - `connectingSourceId: string | null`
  - `cancelConnecting: () => void`
  - `activeLocationSourceId: string` (already existed, unchanged shape)
  - `locationSourceUnavailable: boolean` (already existed, unchanged shape)
  - `watchingLocation: boolean` (unchanged shape, now derived as `locationWatchStatus !== "idle"` — every existing consumer keeps working unmodified)

- [ ] **Step 1: Add the `LocationWatchStatus` type and a cancellation ref**

Add this type export near the top of the file, right after the existing top-level `const` declarations (after `const { internalGpsSourceId } = ExternalGpsService;` around line 17):

```ts
export type LocationWatchStatus = "idle" | "connecting" | "watching";
```

Then, inside `useLocationWatch`, add a new ref alongside the existing ones (right after `const locationAveragerRef = useRef(null as LocationAverager | null);` around line 76):

```ts
  const locationAveragerRef = useRef(null as LocationAverager | null);
  const cancelRequestedRef = useRef(false);
```

- [ ] **Step 2: Replace the boolean state with the status machine**

Replace this block (original lines 88–102):

```ts
  const [state, setState] = useState({
    watchingLocation: false,
    locationWatchElapsedTime: 0,
    locationWatchProgress: 0,
    activeLocationSourceId: internalGpsSourceId,
    locationSourceUnavailable: false,
  });

  const {
    locationWatchElapsedTime,
    locationWatchProgress,
    watchingLocation,
    activeLocationSourceId,
    locationSourceUnavailable,
  } = state;
```

with:

```ts
  const [state, setState] = useState({
    status: "idle" as LocationWatchStatus,
    locationWatchElapsedTime: 0,
    locationWatchProgress: 0,
    activeLocationSourceId: internalGpsSourceId,
    connectingSourceId: null as string | null,
    locationSourceUnavailable: false,
  });

  const {
    status,
    locationWatchElapsedTime,
    locationWatchProgress,
    activeLocationSourceId,
    connectingSourceId,
    locationSourceUnavailable,
  } = state;

  const watchingLocation = status !== "idle";
```

- [ ] **Step 3: Update `_stopLocationWatch` to reset `status`**

In `_stopLocationWatch` (original lines 109–126), change the inner `setState` call from:

```ts
      setState((statePrev) => ({
        ...statePrev,
        locationWatchElapsedTime: 0,
        watchingLocation: false,
      }));
```

to:

```ts
      setState((statePrev) => ({
        ...statePrev,
        locationWatchElapsedTime: 0,
        status: "idle",
      }));
```

- [ ] **Step 4: Add `cancelConnecting`**

Add this new callback right after the existing `stopLocationWatch` definition (original lines 187–194), before `startLocationWatch`:

```ts
  const cancelConnecting = useCallback(() => {
    if (status !== "connecting") return;
    log.debug("Cancelling GPS connection attempt");
    cancelRequestedRef.current = true;
    setState((statePrev) => ({
      ...statePrev,
      status: "idle",
      connectingSourceId: null,
    }));
  }, [status]);
```

- [ ] **Step 5: Rewrite `startLocationWatch`**

Replace the entire `startLocationWatch` callback (original lines 196–309) with:

```ts
  const startLocationWatch = useCallback(async () => {
    log.debug("Starting location watch");
    cancelRequestedRef.current = false;

    // Starts watching with the phone's internal GPS. Used both as the default
    // provider and as the same-session fallback when an external source fails.
    const startInternalGpsWatch = async (): Promise<boolean> => {
      if (!(await Permissions.requestLocationForegroundPermission())) {
        if (!(await Permissions.isLocationServiceEnabled())) {
          toaster("device:locationServiceDisabled.warning");
        }
        return false;
      }
      locationSubscriptionRef.current = await Location.watchPositionAsync(
        { accuracy, distanceInterval },
        (location) => locationCallback(locationToLocationPoint(location)),
      );
      return true;
    };

    // "auto" resolves to the first recognized connected external GPS device if one
    // is available, else internal GPS - so a paired Bad Elf (or similar) is used
    // automatically without a manual settings trip.
    const resolvedSourceId =
      preferredGpsSourceId === GpsSourceSetting.auto
        ? await ExternalGpsService.resolveAutoSourceId()
        : preferredGpsSourceId;

    const useExternalSource = resolvedSourceId !== internalGpsSourceId;

    if (useExternalSource) {
      // Surface "connecting" feedback immediately - before the permission prompt -
      // since that prompt (or the Bluetooth handshake after it) is what's slow.
      setState((statePrev) => ({
        ...statePrev,
        status: "connecting",
        connectingSourceId: resolvedSourceId,
      }));

      if (!(await Permissions.requestBluetoothPermissions())) {
        setState((statePrev) => ({
          ...statePrev,
          status: "idle",
          connectingSourceId: null,
        }));
        return;
      }
    } else if (!(await Permissions.requestLocationForegroundPermission())) {
      if (!(await Permissions.isLocationServiceEnabled())) {
        toaster("device:locationServiceDisabled.warning");
      }
      return;
    }

    if (cancelRequestedRef.current) {
      cancelRequestedRef.current = false;
      return;
    }

    _stopLocationWatch();

    let activeSourceId = resolvedSourceId;
    let sourceUnavailable = false;
    let started: boolean;

    if (useExternalSource) {
      try {
        log.info(
          `Location watch: starting with external GPS source ${resolvedSourceId}`,
        );
        const subscription = await ExternalGpsService.watchPosition(
          { sourceId: resolvedSourceId },
          (locationPoint) => locationCallback(locationPoint),
        );
        if (cancelRequestedRef.current) {
          log.debug(
            "Location watch: connect succeeded after cancel, releasing immediately",
          );
          subscription.remove();
          cancelRequestedRef.current = false;
          return;
        }
        locationSubscriptionRef.current = subscription;
        started = true;
      } catch (error) {
        log.warn(
          `Location watch: external GPS source ${resolvedSourceId} unavailable, falling back to internal GPS for this session`,
          error,
        );
        if (cancelRequestedRef.current) {
          cancelRequestedRef.current = false;
          return;
        }
        sourceUnavailable = true;
        activeSourceId = internalGpsSourceId;
        started = await startInternalGpsWatch();
      }
    } else {
      log.debug("Location watch: starting with internal GPS");
      started = await startInternalGpsWatch();
    }

    if (!started) {
      setState((statePrev) => ({
        ...statePrev,
        status: "idle",
        connectingSourceId: null,
      }));
      return;
    }

    if (cancelRequestedRef.current) {
      cancelRequestedRef.current = false;
      _stopLocationWatch();
      return;
    }

    if (locationAveragingEnabled) {
      locationAveragerRef.current = new LocationAverager();
    }

    if (stopOnTimeout) {
      locationWatchIntervalRef.current = setInterval(() => {
        setState((statePrev) => {
          const elapsedTimeNext =
            statePrev.locationWatchElapsedTime +
            locationWatchElapsedTimeIntervalDelay;
          return {
            ...statePrev,
            locationWatchElapsedTime: elapsedTimeNext,
            locationWatchProgress: elapsedTimeNext / locationWatchTimeout,
          };
        });
      }, locationWatchElapsedTimeIntervalDelay);

      locationAccuracyWatchTimeoutRef.current = setTimeout(() => {
        log.debug("Location watch timeout reached");
        stopLocationWatch();
      }, locationWatchTimeout);
    }
    setState((statePrev) => ({
      ...statePrev,
      status: "watching",
      activeLocationSourceId: activeSourceId,
      locationSourceUnavailable: sourceUnavailable,
    }));
  }, [
    _stopLocationWatch,
    accuracy,
    distanceInterval,
    locationAveragingEnabled,
    preferredGpsSourceId,
    stopOnTimeout,
    toaster,
    locationCallback,
    locationWatchTimeout,
    stopLocationWatch,
  ]);
```

Notes for the implementer:
- `connectingSourceId` is deliberately **not** cleared when the attempt succeeds (whether the external device came up, or it failed and we fell back to internal) — while `watching` with `locationSourceUnavailable === true`, `connectingSourceId` still holds the external source id that failed, which Task 3 needs to render "Using internal GPS (`<that device>` unavailable)". It only gets cleared by `cancelConnecting` (optimistic reset) or overwritten by the next `startLocationWatch` call.
- The old toast call `toaster("device:externalGps.unavailable.warning")` in the catch block is intentionally removed — replaced by the persistent status line built in Task 3. Do not re-add it.

- [ ] **Step 6: Update the hook's return statement**

Replace the return statement (original lines 311–321):

```ts
  return {
    activeLocationSourceId,
    locationAccuracyThreshold,
    locationSourceUnavailable,
    locationWatchElapsedTime,
    locationWatchProgress,
    locationWatchTimeout,
    startLocationWatch,
    stopLocationWatch,
    watchingLocation,
  };
```

with:

```ts
  return {
    activeLocationSourceId,
    cancelConnecting,
    connectingSourceId,
    locationAccuracyThreshold,
    locationSourceUnavailable,
    locationWatchElapsedTime,
    locationWatchProgress,
    locationWatchStatus: status,
    locationWatchTimeout,
    startLocationWatch,
    stopLocationWatch,
    watchingLocation,
  };
```

- [ ] **Step 7: Re-export the new type from `hooks/index.ts`**

Add a line right after `export { useLocationWatch } from "./useLocationWatch";` (line 12):

```ts
export { useLocationWatch } from "./useLocationWatch";
export type { LocationWatchStatus } from "./useLocationWatch";
```

- [ ] **Step 8: Type-check and lint**

Run: `yarn test:types`
Expected: no new TypeScript errors.

Run: `yarn lint`
Expected: no new lint errors (auto-fixable issues are fixed in place).

- [ ] **Step 9: Manual regression check**

`useLocationWatch`'s three other consumers (`src/hooks/useLocation.ts`, `src/components/GeoPolygonEditor/useGeoPolygonEditor.ts`, `src/screens/RecordEditor/NodeComponentSwitch/nodeTypes/NodeCoordinateComponent/LocationNavigator/useLocationNavigator.ts`) only destructure `startLocationWatch`/`stopLocationWatch` (or, for `useLocation.ts`, also `locationAccuracyThreshold`, `locationWatchElapsedTime`, `locationWatchProgress`, `locationWatchTimeout` — all untouched). Confirm none of them destructure `watchingLocation` directly from this hook's result (grep for `useLocationWatch` usage sites) — they don't, so no other file needs changes for this task. Start the app (`yarn android` or `yarn ios`) and open a coordinate field's "Get location" with no external GPS device paired — behavior must be pixel-identical to before this change (no status line, normal accuracy/progress UI once watching).

- [ ] **Step 10: Commit**

```bash
git add src/hooks/useLocationWatch.ts src/hooks/index.ts
git commit -m "$(cat <<'EOF'
Add connecting/cancel state machine to useLocationWatch

Introduces an explicit idle/connecting/watching status so callers can
show feedback while an external GPS Bluetooth connect is in flight, and
a cancelConnecting() escape hatch for a hung connect attempt.
EOF
)"
```

---

### Task 2: `useAvailableGpsSources` loading flag

**Files:**
- Modify: `src/hooks/useAvailableGpsSources.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: new return field `loading: boolean` (`true` initially and during any in-flight `refreshAvailableGpsSources()` call).

- [ ] **Step 1: Add the `loading` state**

Replace the full body of `useAvailableGpsSources` with:

```ts
export const useAvailableGpsSources = () => {
  const isMountedRef = useIsMountedRef();
  const [availableGpsSources, setAvailableGpsSources] = useState<
    GpsSourceDescriptor[]
  >([]);
  const [loading, setLoading] = useState(true);

  const refreshAvailableGpsSources = useCallback(async () => {
    setLoading(true);
    try {
      const sources = await ExternalGpsService.listAvailableSources();
      if (isMountedRef.current) {
        setAvailableGpsSources(sources);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [isMountedRef]);

  useEffect(() => {
    refreshAvailableGpsSources();
  }, [refreshAvailableGpsSources]);

  useNavigationFocus(refreshAvailableGpsSources);

  return { availableGpsSources, loading, refreshAvailableGpsSources };
};
```

- [ ] **Step 2: Type-check and lint**

Run: `yarn test:types`
Expected: no new TypeScript errors.

Run: `yarn lint`
Expected: no new lint errors.

- [ ] **Step 3: Manual check**

The Settings screen's `GpsSourceSettingsField.tsx` also calls this hook — confirm it destructures only `availableGpsSources` (and maybe `refreshAvailableGpsSources`), not a positional/array form, so adding a new object field doesn't break it. Run the app and open Settings → GPS source: the field should behave exactly as before.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useAvailableGpsSources.ts
git commit -m "$(cat <<'EOF'
Add loading flag to useAvailableGpsSources

Lets consumers show a loading affordance while the bonded-devices list
is being refreshed, instead of silently popping in.
EOF
)"
```

---

### Task 3: Status-line UI in `LocationWatchingMonitor` + wiring

**Files:**
- Modify: `src/components/LocationWatchingMonitor/LocationWatchingMonitor.tsx`
- Modify: `src/components/LocationWatchingMonitor/styles.ts`
- Modify: `src/localization/en/dataEntry.ts`
- Modify: `src/screens/RecordEditor/NodeComponentSwitch/nodeTypes/NodeCoordinateComponent/useNodeCoordinateComponent.ts`
- Modify: `src/screens/RecordEditor/NodeComponentSwitch/nodeTypes/NodeCoordinateComponent/NodeCoordinateComponent.tsx`

This task must land as one unit: `LocationWatchingMonitor`'s prop interface changes (drops `watchingLocation`, adds required `locationWatchStatus`), so its only caller (`NodeCoordinateComponent.tsx`, via `useNodeCoordinateComponent.ts`) has to be updated in the same commit or the project won't type-check.

**Interfaces:**
- Consumes: `locationWatchStatus`, `connectingSourceId`, `cancelConnecting`, `activeLocationSourceId`, `locationSourceUnavailable` from Task 1's `useLocationWatch`; `loading` from Task 2's `useAvailableGpsSources`.
- Produces: no further consumers — this is the leaf UI.

- [ ] **Step 1: Add new localization keys**

In `src/localization/en/dataEntry.ts`, inside the `coordinate: { ... }` object:

Change:

```ts
    confirmConvertCoordinate:
      "Convert coordinate from SRS {{srsFrom}} to SRS {{srsTo}}?",
    convert: "Convert",
```

to:

```ts
    confirmConvertCoordinate:
      "Convert coordinate from SRS {{srsFrom}} to SRS {{srsTo}}?",
    connectingToSource: "Connecting to {{label}}...",
    convert: "Convert",
```

Change:

```ts
    distance: "Distance (m)",
    getLocation: "Get location",
```

to:

```ts
    distance: "Distance (m)",
    externalGpsGenericLabel: "external GPS device",
    getLocation: "Get location",
```

Change:

```ts
    useCurrentLocation: "Use current location",
    x: "X",
```

to:

```ts
    useCurrentLocation: "Use current location",
    usingInternalFallback: "Using internal GPS ({{label}} unavailable)",
    usingSource: "Using {{label}}",
    x: "X",
```

- [ ] **Step 2: Add new styles**

Replace `src/components/LocationWatchingMonitor/styles.ts` with:

```ts
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  outerContainer: { gap: 4 },
  accuracyProgressBarWrapper: { width: "80%" },
  button: { alignSelf: "center" },
  gpsSourceLoadingIcon: { marginHorizontal: 12 },
  sourceStatusText: { alignSelf: "center" },
  startRow: { alignItems: "center", justifyContent: "space-between" },
});
```

- [ ] **Step 3: Rewrite `LocationWatchingMonitor.tsx`**

Replace the entire file with:

```tsx
import { log } from "utils";
import { useTranslation } from "localization";
import type { LocationWatchStatus } from "hooks";
import { GpsSourceSetting } from "model";
import { GpsSourceDescriptor } from "service/externalGps/types";
import { FieldSet } from "../FieldSet";
import { Button } from "../Button";
import { HView } from "../HView";
import { LoadingIcon } from "../LoadingIcon";
import { MenuButton } from "../MenuButton";
import { Text } from "../Text";
import { View } from "../View";
import { VView } from "../VView";
import { AccuracyProgressBar } from "./AccuracyProgressBar";
import { ElapsedTimeProgressBar } from "./ElapsedTimeProgressBar";

import styles from "./styles";

type LocationWatchingMonitorProps = {
  activeLocationSourceId?: string;
  availableGpsSources?: GpsSourceDescriptor[];
  connectingSourceId?: string | null;
  gpsSourcesLoading?: boolean;
  locationAccuracy?: number | string | null;
  locationAccuracyThreshold: number;
  locationSourceUnavailable?: boolean;
  locationWatchElapsedTime: number;
  locationWatchStatus: LocationWatchStatus;
  locationWatchTimeout: number;
  onCancelConnecting?: () => void;
  onSelectGpsSource?: (sourceId: string) => void;
  onStart: () => void;
  onStop: () => void;
  preferredGpsSourceId?: string;
};

export const LocationWatchingMonitor = (
  props: LocationWatchingMonitorProps
) => {
  const {
    activeLocationSourceId,
    availableGpsSources = [],
    connectingSourceId,
    gpsSourcesLoading = false,
    locationAccuracy,
    locationAccuracyThreshold,
    locationSourceUnavailable,
    locationWatchElapsedTime,
    locationWatchStatus,
    locationWatchTimeout,
    onCancelConnecting,
    onSelectGpsSource,
    onStart,
    onStop,
    preferredGpsSourceId,
  } = props;

  log.debug(`rendering LocationWatchingMonitor`);

  const { t } = useTranslation();

  const isIdle = locationWatchStatus === "idle";
  const isConnecting = locationWatchStatus === "connecting";
  const isWatching = locationWatchStatus === "watching";

  const getSourceLabel = (sourceId?: string | null) => {
    if (!sourceId) return "";
    const source = availableGpsSources.find((item) => item.id === sourceId);
    return source?.label ?? t("dataEntry:coordinate.externalGpsGenericLabel");
  };

  // Only worth showing a source picker once there's an actual choice - i.e. at
  // least one recognized external GPS device is bonded, in addition to internal.
  // Hidden while connecting/watching to avoid swapping source mid-capture (would
  // confuse in-flight location averaging).
  const gpsSourceMenuVisible =
    isIdle && !!onSelectGpsSource && availableGpsSources.length > 1;

  const gpsSourceMenuItems = gpsSourceMenuVisible
    ? [
        {
          key: GpsSourceSetting.auto,
          label: "settings:preferredGpsSourceId.auto",
          icon:
            preferredGpsSourceId === GpsSourceSetting.auto
              ? "check"
              : undefined,
          onPress: () => onSelectGpsSource!(GpsSourceSetting.auto),
        },
        ...availableGpsSources.map((source) => ({
          key: source.id,
          label:
            source.type === "internal"
              ? "settings:preferredGpsSourceId.internal"
              : source.label,
          icon: preferredGpsSourceId === source.id ? "check" : undefined,
          onPress: () => onSelectGpsSource!(source.id),
        })),
      ]
    : [];

  const locationAccuracyFormatted =
    typeof locationAccuracy === "string"
      ? locationAccuracy
      : locationAccuracy?.toFixed?.(2);

  // Shown only when an external device is actually relevant this session - either
  // it's the active source, or we fell back from it to internal GPS. The plain
  // "internal GPS only, no external device involved" case stays unchanged.
  const activeSourceIsExternal =
    !!activeLocationSourceId &&
    activeLocationSourceId !== GpsSourceSetting.internal;
  const showActiveSourceLine =
    isWatching && (activeSourceIsExternal || !!locationSourceUnavailable);

  return (
    <VView style={styles.outerContainer}>
      {isConnecting && (
        <Text
          textKey="dataEntry:coordinate.connectingToSource"
          textParams={{ label: getSourceLabel(connectingSourceId) }}
        />
      )}
      {isWatching && (
        <>
          <FieldSet headerKey="dataEntry:coordinate.accuracy">
            <HView>
              <View style={styles.accuracyProgressBarWrapper}>
                <AccuracyProgressBar
                  accuracy={Number(locationAccuracy)}
                  accuracyThreshold={locationAccuracyThreshold}
                />
              </View>
              <Text>{locationAccuracyFormatted} m</Text>
            </HView>
          </FieldSet>
          <ElapsedTimeProgressBar
            elapsedTime={locationWatchElapsedTime}
            elapsedTimeThreshold={locationWatchTimeout}
          />
          {showActiveSourceLine && (
            <Text
              style={styles.sourceStatusText}
              textKey={
                locationSourceUnavailable
                  ? "dataEntry:coordinate.usingInternalFallback"
                  : "dataEntry:coordinate.usingSource"
              }
              textParams={{
                label: locationSourceUnavailable
                  ? getSourceLabel(connectingSourceId)
                  : getSourceLabel(activeLocationSourceId),
              }}
            />
          )}
        </>
      )}
      {isIdle && (
        <HView fullWidth style={styles.startRow}>
          <Button
            icon="play"
            onPress={onStart}
            style={styles.button}
            textKey="dataEntry:coordinate.getLocation"
          />
          {gpsSourcesLoading ? (
            <LoadingIcon size={24} style={styles.gpsSourceLoadingIcon} />
          ) : (
            gpsSourceMenuVisible && (
              <MenuButton
                icon="crosshairs-gps"
                items={gpsSourceMenuItems}
                label="settings:preferredGpsSourceId.label"
                mode="text"
              />
            )
          )}
        </HView>
      )}
      {isConnecting && (
        <Button
          icon="close"
          onPress={onCancelConnecting}
          style={styles.button}
          textKey="common:cancel"
        />
      )}
      {isWatching && (
        <Button
          icon="stop"
          onPress={onStop}
          style={styles.button}
          textKey="common:stop"
        />
      )}
    </VView>
  );
};
```

- [ ] **Step 4: Wire the new fields through `useNodeCoordinateComponent.ts`**

Replace this block (original lines 238–250):

```ts
  const {
    activeLocationSourceId,
    locationAccuracyThreshold,
    locationWatchElapsedTime,
    locationWatchProgress,
    locationWatchTimeout,
    startLocationWatch,
    stopLocationWatch,
    watchingLocation,
  } = useLocationWatch({ locationCallback });

  const { preferredGpsSourceId } = SettingsSelectors.useSettings();
  const { availableGpsSources } = useAvailableGpsSources();
```

with:

```ts
  const {
    activeLocationSourceId,
    cancelConnecting,
    connectingSourceId,
    locationAccuracyThreshold,
    locationSourceUnavailable,
    locationWatchElapsedTime,
    locationWatchProgress,
    locationWatchStatus,
    locationWatchTimeout,
    startLocationWatch,
    stopLocationWatch,
    watchingLocation,
  } = useLocationWatch({ locationCallback });

  const { preferredGpsSourceId } = SettingsSelectors.useSettings();
  const { availableGpsSources, loading: gpsSourcesLoading } =
    useAvailableGpsSources();
```

Add a new callback right after `onStopGpsPress` (original lines 311–313):

```ts
  const onStopGpsPress = useCallback(() => {
    stopLocationWatch();
  }, [stopLocationWatch]);
```

insert directly below it:

```ts
  const onCancelGpsConnectPress = useCallback(() => {
    cancelConnecting();
  }, [cancelConnecting]);
```

Finally, replace the return statement (original lines 356–386):

```ts
  return {
    accuracy,
    activeLocationSourceId,
    applicable,
    availableGpsSources,
    compassNavigatorVisible,
    deleteButtonVisible,
    distanceTarget,
    editable,
    hideCompassNavigator,
    includedExtraFields,
    inputFieldsEditable,
    locationAccuracyThreshold,
    locationWatchElapsedTime,
    locationWatchTimeout,
    onChangeSrs,
    onChangeValueField,
    onClearPress,
    onCompassNavigatorUseCurrentLocation,
    onSelectGpsSource,
    onStartGpsPress,
    onStopGpsPress,
    preferredGpsSourceId,
    showCompassNavigator,
    srs,
    srsIndex,
    uiValue,
    watchingLocation,
  };
```

with:

```ts
  return {
    accuracy,
    activeLocationSourceId,
    applicable,
    availableGpsSources,
    compassNavigatorVisible,
    connectingSourceId,
    deleteButtonVisible,
    distanceTarget,
    editable,
    gpsSourcesLoading,
    hideCompassNavigator,
    includedExtraFields,
    inputFieldsEditable,
    locationAccuracyThreshold,
    locationSourceUnavailable,
    locationWatchElapsedTime,
    locationWatchStatus,
    locationWatchTimeout,
    onCancelGpsConnectPress,
    onChangeSrs,
    onChangeValueField,
    onClearPress,
    onCompassNavigatorUseCurrentLocation,
    onSelectGpsSource,
    onStartGpsPress,
    onStopGpsPress,
    preferredGpsSourceId,
    showCompassNavigator,
    srs,
    srsIndex,
    uiValue,
    watchingLocation,
  };
```

- [ ] **Step 5: Wire the new fields through `NodeCoordinateComponent.tsx`**

Replace the destructure (original lines 27–54):

```ts
  const {
    accuracy,
    applicable,
    availableGpsSources,
    compassNavigatorVisible,
    deleteButtonVisible,
    distanceTarget,
    editable,
    hideCompassNavigator,
    includedExtraFields,
    inputFieldsEditable,
    locationAccuracyThreshold,
    locationWatchElapsedTime,
    locationWatchTimeout,
    onChangeSrs,
    onChangeValueField,
    onClearPress,
    onCompassNavigatorUseCurrentLocation,
    onSelectGpsSource,
    onStartGpsPress,
    onStopGpsPress,
    preferredGpsSourceId,
    showCompassNavigator,
    srs,
    srsIndex,
    uiValue,
    watchingLocation,
  } = useNodeCoordinateComponent(props);
```

with:

```ts
  const {
    accuracy,
    activeLocationSourceId,
    applicable,
    availableGpsSources,
    compassNavigatorVisible,
    connectingSourceId,
    deleteButtonVisible,
    distanceTarget,
    editable,
    gpsSourcesLoading,
    hideCompassNavigator,
    includedExtraFields,
    inputFieldsEditable,
    locationAccuracyThreshold,
    locationSourceUnavailable,
    locationWatchElapsedTime,
    locationWatchStatus,
    locationWatchTimeout,
    onCancelGpsConnectPress,
    onChangeSrs,
    onChangeValueField,
    onClearPress,
    onCompassNavigatorUseCurrentLocation,
    onSelectGpsSource,
    onStartGpsPress,
    onStopGpsPress,
    preferredGpsSourceId,
    showCompassNavigator,
    srs,
    srsIndex,
    uiValue,
    watchingLocation,
  } = useNodeCoordinateComponent(props);
```

Replace the `LocationWatchingMonitor` usage (original lines 130–143):

```tsx
      {editable && (
        <LocationWatchingMonitor
          availableGpsSources={availableGpsSources}
          locationAccuracy={accuracy}
          locationAccuracyThreshold={locationAccuracyThreshold}
          locationWatchElapsedTime={locationWatchElapsedTime}
          locationWatchTimeout={locationWatchTimeout}
          onSelectGpsSource={onSelectGpsSource}
          onStart={onStartGpsPress}
          onStop={onStopGpsPress}
          preferredGpsSourceId={preferredGpsSourceId}
          watchingLocation={watchingLocation}
        />
      )}
```

with:

```tsx
      {editable && (
        <LocationWatchingMonitor
          activeLocationSourceId={activeLocationSourceId}
          availableGpsSources={availableGpsSources}
          connectingSourceId={connectingSourceId}
          gpsSourcesLoading={gpsSourcesLoading}
          locationAccuracy={accuracy}
          locationAccuracyThreshold={locationAccuracyThreshold}
          locationSourceUnavailable={locationSourceUnavailable}
          locationWatchElapsedTime={locationWatchElapsedTime}
          locationWatchStatus={locationWatchStatus}
          locationWatchTimeout={locationWatchTimeout}
          onCancelConnecting={onCancelGpsConnectPress}
          onSelectGpsSource={onSelectGpsSource}
          onStart={onStartGpsPress}
          onStop={onStopGpsPress}
          preferredGpsSourceId={preferredGpsSourceId}
        />
      )}
```

`watchingLocation` stays used elsewhere in this same file (the numeric-field `editable` props, the `SrsDropdown` `editable` prop, and the `{!watchingLocation && (...)}` row with `OpenMapButton`/compass/delete buttons) — leave those as-is; they now also correctly lock during the `connecting` phase since `watchingLocation` is `true` for both `connecting` and `watching`.

- [ ] **Step 6: Type-check and lint**

Run: `yarn test:types`
Expected: no new TypeScript errors (this is the step that will surface any prop-shape mismatch between `LocationWatchingMonitor` and its caller — resolve before moving on).

Run: `yarn lint`
Expected: no new lint errors.

- [ ] **Step 7: Manual verification on a device with a paired external GPS**

- No external device paired: open a coordinate field, press "Get location" — behavior is pixel-identical to before (no status line at any point, normal accuracy/progress UI while watching).
- External device paired and reachable: press "Get location" — see "Connecting to `<device>`..." with a Cancel button, then once connected the accuracy/progress UI appears with a persistent "Using `<device>`" line, then Stop.
- External device paired but unreachable (e.g. powered off): press "Get location" — see "Connecting to `<device>`...", then it falls back and the accuracy/progress UI shows "Using internal GPS (`<device>` unavailable)".
- Press Cancel while "Connecting to `<device>`..." is showing — row returns to idle immediately.
- GPS-source menu: navigate into the screen — briefly see the loading spinner in place of the source-menu icon, then it resolves to the normal menu (or nothing, if no external device is paired).

- [ ] **Step 8: Commit**

```bash
git add src/components/LocationWatchingMonitor/LocationWatchingMonitor.tsx \
        src/components/LocationWatchingMonitor/styles.ts \
        src/localization/en/dataEntry.ts \
        src/screens/RecordEditor/NodeComponentSwitch/nodeTypes/NodeCoordinateComponent/useNodeCoordinateComponent.ts \
        src/screens/RecordEditor/NodeComponentSwitch/nodeTypes/NodeCoordinateComponent/NodeCoordinateComponent.tsx
git commit -m "$(cat <<'EOF'
Add GPS status feedback to LocationWatchingMonitor

Shows "Connecting to <device>..." with a Cancel button while an
external GPS Bluetooth connect is in flight, a persistent "Using
<device>" line while it's active, "Using internal GPS (<device>
unavailable)" on same-session fallback, and a loading spinner on the
GPS-source menu while the bonded-devices list refreshes.
EOF
)"
```

---

### Task 4: Remove the now-unused fallback toast locale key

**Files:**
- Modify: `src/localization/am/device.ts`
- Modify: `src/localization/de/device.ts`
- Modify: `src/localization/en/device.ts`
- Modify: `src/localization/es/device.ts`
- Modify: `src/localization/fa/device.ts`
- Modify: `src/localization/fi/device.ts`
- Modify: `src/localization/fr/device.ts`
- Modify: `src/localization/id/device.ts`
- Modify: `src/localization/ja/device.ts`
- Modify: `src/localization/pt/device.ts`
- Modify: `src/localization/ru/device.ts`
- Modify: `src/localization/sv/device.ts`

Task 1 already removed the only call site of `device:externalGps.unavailable.warning` (the toast in `useLocationWatch.ts`). This task deletes the now-dead key from all 12 locale files. Each file has the identical `externalGps: { unavailable: { warning: "..." } }` block (verified structurally identical, just different indentation width and 1 vs 2-line string wrapping, across all 12 files).

**Interfaces:** None — pure content deletion, no code depends on this key anymore after Task 1.

- [ ] **Step 1: Confirm no other call sites exist**

Run: `grep -rn "externalGps.unavailable" src --include="*.ts" --include="*.tsx" | grep -v /localization/`
Expected: no output (empty) — confirms Task 1 already removed the only reference.

- [ ] **Step 2: Remove the block from all 12 locale files**

Run from the project root:

```bash
for f in am de en es fa fi fr id ja pt ru sv; do
  perl -0777 -pi -e 's/  externalGps: \{\n    unavailable: \{\n(?:.*\n)*?    \},\n  \},\n//' "src/localization/$f/device.ts"
done
```

(This exact regex was dry-run tested against copies of all 12 files before writing this plan: it removes exactly the `externalGps: { unavailable: { warning: ... } }` block in every file, leaving brace balance intact, with zero remaining `externalGps` occurrences afterward.)

- [ ] **Step 3: Verify the key is gone and nothing else changed**

Run: `grep -rl "externalGps" src/localization/*/device.ts`
Expected: no output (empty).

Run: `git diff --stat`
Expected: exactly the 12 `device.ts` files listed above, each with a small deletion (no other files touched, no additions).

- [ ] **Step 4: Type-check and lint**

Run: `yarn test:types`
Expected: no new TypeScript errors.

Run: `yarn lint`
Expected: no new lint errors.

- [ ] **Step 5: Commit**

```bash
git add src/localization/am/device.ts src/localization/de/device.ts src/localization/en/device.ts \
        src/localization/es/device.ts src/localization/fa/device.ts src/localization/fi/device.ts \
        src/localization/fr/device.ts src/localization/id/device.ts src/localization/ja/device.ts \
        src/localization/pt/device.ts src/localization/ru/device.ts src/localization/sv/device.ts
git commit -m "$(cat <<'EOF'
Remove unused externalGps unavailable locale key

Its only call site (the fallback toast in useLocationWatch) was
replaced by a persistent status line in LocationWatchingMonitor.
EOF
)"
```
