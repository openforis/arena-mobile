import { useCallback, useRef, useState } from "react";
import * as Location from "expo-location";
import { Point, PointFactory } from "@openforis/arena-core";

import { AveragedLocation, GpsSourceSetting, LocationPoint } from "model";
import { log, Permissions, Refs } from "utils";
import { LocationAverager } from "utils/LocationAverageCalculator";
import { ExternalGpsService } from "service/externalGps/ExternalGpsService";
import { SettingsSelectors } from "../state/settings";
import { useIsMountedRef } from "./useIsMountedRef";
import { useToast } from "./useToast";
import { handleExternalGpsDisconnect } from "./useLocationWatchDisconnect";

const locationWatchElapsedTimeIntervalDelay = 1000;
const defaultLocationAccuracyThreshold = 4;
const defaultLocationAccuracyWatchTimeout = 120000; // 2 mins
const minLocationReadingsForAccuracyThreshold = 5;
const { internalGpsSourceId } = ExternalGpsService;

export type LocationWatchStatus = "idle" | "connecting" | "watching";

type LocationSubscription = { remove: () => void };

const locationPointToPoint = (locationPoint: LocationPoint): Point | null => {
  if (!locationPoint) return null;

  const { latitude, longitude } = locationPoint;

  return PointFactory.createInstance({
    x: longitude,
    y: latitude,
  });
};

const locationToLocationPoint = (
  location: Location.LocationObject,
): LocationPoint => {
  const { coords } = location;
  return { ...coords, accuracy: coords.accuracy };
};

const getLocationWatchTimeout = ({ settings }: any) => {
  const {
    locationAccuracyWatchTimeout: locationAccuracyWatchTimeoutSetting, // in seconds
  } = settings;

  return locationAccuracyWatchTimeoutSetting
    ? locationAccuracyWatchTimeoutSetting * 1000
    : defaultLocationAccuracyWatchTimeout; // in ms
};

export const useLocationWatch = ({
  accuracy = Location.Accuracy.Highest,
  distanceInterval = 0.01,
  locationCallback: locationCallbackProp,
  stopOnAccuracyThreshold = true,
  stopOnTimeout = true,
}: {
  accuracy?: Location.LocationAccuracy;
  distanceInterval?: number;
  locationCallback: (params: {
    location: LocationPoint | null;
    locationAccuracy: number | null | undefined;
    pointLatLong: Point | null;
    thresholdReached: boolean;
  }) => void;
  stopOnAccuracyThreshold?: boolean;
  stopOnTimeout?: boolean;
}) => {
  const isMountedRef = useIsMountedRef();
  const lastLocationRef = useRef(null as LocationPoint | null);
  const locationSubscriptionRef = useRef(null as LocationSubscription | null);
  const locationAccuracyWatchTimeoutRef = useRef(
    null as ReturnType<typeof setTimeout> | null,
  );
  const locationWatchIntervalRef = useRef(
    null as ReturnType<typeof setInterval> | null,
  );
  const locationAveragerRef = useRef(null as LocationAverager | null);
  const startAttemptIdRef = useRef(0);
  const cancelledAttemptIdRef = useRef(0);
  const shouldFallbackToInternalRef = useRef(false);
  const toaster = useToast();

  const settings = SettingsSelectors.useSettings();
  const {
    locationAccuracyThreshold = defaultLocationAccuracyThreshold,
    locationAveragingEnabled,
    preferredGpsSourceId = GpsSourceSetting.auto,
  } = settings;

  const locationWatchTimeout = getLocationWatchTimeout({ settings });

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

  const clearLocationWatchTimeout = useCallback(() => {
    Refs.clearIntervalRef(locationWatchIntervalRef);
    Refs.clearTimeoutRef(locationAccuracyWatchTimeoutRef);
  }, []);

  const _stopLocationWatch = useCallback(() => {
    const subscription = locationSubscriptionRef.current;
    const wasActive = !!subscription;
    if (wasActive) {
      log.debug("Stopping location watch");
      subscription.remove();
      locationSubscriptionRef.current = null;

      clearLocationWatchTimeout();

      setState((statePrev) => ({
        ...statePrev,
        locationWatchElapsedTime: 0,
        status: "idle",
      }));
    }
    return wasActive;
  }, [clearLocationWatchTimeout]);

  const locationCallback = useCallback(
    (locationPointParam: LocationPoint | null) => {
      if (!locationPointParam) {
        lastLocationRef.current = locationPointParam; // location could be null when watch timeout is reached
        return;
      }

      let locationPoint: LocationPoint | AveragedLocation | null =
        locationPointParam;

      if (locationAveragingEnabled) {
        const locationAverager = locationAveragerRef.current;
        if (!locationAverager) return;
        locationAverager.addReading(locationPointParam);
        locationPoint = locationAverager.calculateAveragedLocation();
      }

      lastLocationRef.current = locationPoint;

      if (!locationPoint) return;

      const { accuracy: locationAccuracy } = locationPoint;

      const accuracyThresholdReached =
        stopOnAccuracyThreshold &&
        locationAccuracy &&
        locationAccuracy <= locationAccuracyThreshold &&
        (!locationAveragingEnabled ||
          (locationPoint as AveragedLocation).count >
            minLocationReadingsForAccuracyThreshold);

      const timeoutReached =
        stopOnTimeout && locationSubscriptionRef.current === null;

      const thresholdReached = accuracyThresholdReached || timeoutReached;

      if (thresholdReached) {
        log.debug("Threshold reached");
        _stopLocationWatch();
      }
      const pointLatLong = locationPointToPoint(locationPoint);

      locationCallbackProp({
        location: locationPoint,
        locationAccuracy,
        pointLatLong,
        thresholdReached,
      });
    },
    [
      locationAveragingEnabled,
      stopOnAccuracyThreshold,
      locationAccuracyThreshold,
      stopOnTimeout,
      locationCallbackProp,
      _stopLocationWatch,
    ],
  );

  const stopLocationWatch = useCallback(() => {
    log.debug("Stopping location watch (stopLocationWatch)");
    if (_stopLocationWatch() && isMountedRef.current) {
      locationCallback(lastLocationRef.current);
    }
    lastLocationRef.current = null;
    locationAveragerRef.current = null;
  }, [_stopLocationWatch, isMountedRef, locationCallback]);

  const cancelConnecting = useCallback(() => {
    if (status !== "connecting") return;
    log.debug("Cancelling GPS connection attempt");
    cancelledAttemptIdRef.current = Math.max(
      cancelledAttemptIdRef.current,
      startAttemptIdRef.current,
    );
    setState((statePrev) => ({
      ...statePrev,
      status: "idle",
      connectingSourceId: null,
    }));
  }, [status]);

  const setIdleLocationWatchStatus = useCallback(() => {
    setState((statePrev) => ({
      ...statePrev,
      status: "idle",
      connectingSourceId: null,
    }));
  }, []);

  const markLocationSourceUnavailable = useCallback(() => {
    setState((statePrev) => ({
      ...statePrev,
      locationSourceUnavailable: true,
    }));
  }, []);

  const createInternalGpsSubscription = useCallback(async () => {
    if (!(await Permissions.requestLocationForegroundPermission())) {
      if (!(await Permissions.isLocationServiceEnabled())) {
        toaster("device:locationServiceDisabled.warning");
      }
      return null;
    }

    return Location.watchPositionAsync(
      { accuracy, distanceInterval },
      (location) => locationCallback(locationToLocationPoint(location)),
    );
  }, [accuracy, distanceInterval, locationCallback, toaster]);

  const startInternalGpsWatch = useCallback(async (): Promise<boolean> => {
    const subscription = await createInternalGpsSubscription();
    if (!subscription) return false;
    locationSubscriptionRef.current = subscription;
    return true;
  }, [createInternalGpsSubscription]);

  const activateWatchingState = useCallback(
    ({
      activeSourceId,
      sourceUnavailable,
    }: {
      activeSourceId: string;
      sourceUnavailable: boolean;
    }) => {
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
    },
    [
      locationAveragingEnabled,
      locationWatchTimeout,
      stopLocationWatch,
      stopOnTimeout,
    ],
  );

  const requestGpsPermissions = useCallback(
    async ({
      useExternalSource,
      resolvedSourceId,
      isAttemptCurrent,
    }: {
      useExternalSource: boolean;
      resolvedSourceId: string;
      isAttemptCurrent: () => boolean;
    }) => {
      if (!useExternalSource) {
        const granted = await Permissions.requestLocationForegroundPermission();
        return isAttemptCurrent() ? granted : false;
      }

      // Surface "connecting" feedback immediately - before the permission prompt -
      // since that prompt (or the Bluetooth handshake after it) is what's slow.
      setState((statePrev) => ({
        ...statePrev,
        status: "connecting",
        connectingSourceId: resolvedSourceId,
      }));

      const bluetoothGranted = await Permissions.requestBluetoothPermissions();
      if (!isAttemptCurrent()) return false;
      if (bluetoothGranted) return true;

      setIdleLocationWatchStatus();
      return false;
    },
    [setIdleLocationWatchStatus],
  );

  const handleExternalGpsSourceDisconnected = useCallback(() => {
    void handleExternalGpsDisconnect({
      isWatching: !!locationSubscriptionRef.current,
      shouldFallbackToInternal: shouldFallbackToInternalRef.current,
      stopLocationWatch,
      startInternalGpsWatch,
      activateWatchingState,
      markSourceUnavailable: markLocationSourceUnavailable,
    });
  }, [
    activateWatchingState,
    markLocationSourceUnavailable,
    startInternalGpsWatch,
    stopLocationWatch,
  ]);

  const startWatchForResolvedSource = useCallback(
    async ({
      useExternalSource,
      resolvedSourceId,
      isAttemptCurrent,
    }: {
      useExternalSource: boolean;
      resolvedSourceId: string;
      isAttemptCurrent: () => boolean;
    }) => {
      const staleAttemptResult = () => ({
        activeSourceId: resolvedSourceId,
        sourceUnavailable: false,
        started: false,
      });

      const unavailableInternalResult = () => ({
        activeSourceId: internalGpsSourceId,
        sourceUnavailable: true,
        started: false,
      });

      const releaseStaleSubscription = (subscription: LocationSubscription) => {
        subscription.remove();
        return staleAttemptResult();
      };

      if (!useExternalSource) {
        log.debug("Location watch: starting with internal GPS");
        const subscription = await createInternalGpsSubscription();
        if (!subscription) return staleAttemptResult();
        if (!isAttemptCurrent()) {
          return releaseStaleSubscription(subscription);
        }
        locationSubscriptionRef.current = subscription;
        return {
          activeSourceId: resolvedSourceId,
          sourceUnavailable: false,
          started: true,
        };
      }

      try {
        log.info(
          `Location watch: starting with external GPS source ${resolvedSourceId}`,
        );
        const subscription = await ExternalGpsService.watchPosition(
          { sourceId: resolvedSourceId },
          locationCallback,
          {
            onDisconnected: handleExternalGpsSourceDisconnected,
          },
        );
        if (!isAttemptCurrent()) {
          log.debug(
            "Location watch: connect succeeded for stale attempt, releasing immediately",
          );
          return releaseStaleSubscription(subscription);
        }
        locationSubscriptionRef.current = subscription;
        return {
          activeSourceId: resolvedSourceId,
          sourceUnavailable: false,
          started: true,
        };
      } catch (error) {
        log.warn(
          `Location watch: external GPS source ${resolvedSourceId} unavailable, falling back to internal GPS for this session`,
          error,
        );
        if (!isAttemptCurrent()) return staleAttemptResult();

        const subscription = await createInternalGpsSubscription();
        if (!subscription) return unavailableInternalResult();
        if (!isAttemptCurrent()) {
          return releaseStaleSubscription(subscription);
        }
        locationSubscriptionRef.current = subscription;
        return {
          activeSourceId: internalGpsSourceId,
          sourceUnavailable: true,
          started: true,
        };
      }
    },
    [
      createInternalGpsSubscription,
      handleExternalGpsSourceDisconnected,
      locationCallback,
    ],
  );

  const startLocationWatch = useCallback(async () => {
    log.debug("Starting location watch");
    const attemptId = startAttemptIdRef.current + 1;
    startAttemptIdRef.current = attemptId;

    const isAttemptCurrent = () =>
      attemptId === startAttemptIdRef.current &&
      attemptId > cancelledAttemptIdRef.current;

    // "auto" resolves to the first recognized connected external GPS device if one
    // is available, else internal GPS - so a paired Bad Elf (or similar) is used
    // automatically without a manual settings trip.
    const resolvedSourceId =
      preferredGpsSourceId === GpsSourceSetting.auto
        ? await ExternalGpsService.resolveAutoSourceId()
        : preferredGpsSourceId;

    const useExternalSource = resolvedSourceId !== internalGpsSourceId;
    shouldFallbackToInternalRef.current =
      useExternalSource && preferredGpsSourceId === GpsSourceSetting.auto;

    const permissionsGranted = await requestGpsPermissions({
      useExternalSource,
      resolvedSourceId,
      isAttemptCurrent,
    });
    if (!permissionsGranted || !isAttemptCurrent()) {
      return;
    }

    _stopLocationWatch();

    if (!isAttemptCurrent()) {
      return;
    }

    const { activeSourceId, sourceUnavailable, started } =
      await startWatchForResolvedSource({
        useExternalSource,
        resolvedSourceId,
        isAttemptCurrent,
      });

    if (!isAttemptCurrent()) {
      return;
    }

    if (!started) {
      setIdleLocationWatchStatus();
      return;
    }

    activateWatchingState({
      activeSourceId,
      sourceUnavailable,
    });
  }, [
    activateWatchingState,
    _stopLocationWatch,
    accuracy,
    distanceInterval,
    locationAveragingEnabled,
    preferredGpsSourceId,
    requestGpsPermissions,
    setIdleLocationWatchStatus,
    startWatchForResolvedSource,
    stopOnTimeout,
    locationWatchTimeout,
    stopLocationWatch,
  ]);

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
};
