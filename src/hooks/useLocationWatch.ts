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

const locationWatchElapsedTimeIntervalDelay = 1000;
const defaultLocationAccuracyThreshold = 4;
const defaultLocationAccuracyWatchTimeout = 120000; // 2 mins
const minLocationReadingsForAccuracyThreshold = 5;
const { internalGpsSourceId } = ExternalGpsService;

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
  const toaster = useToast();

  const settings = SettingsSelectors.useSettings();
  const {
    locationAccuracyThreshold = defaultLocationAccuracyThreshold,
    locationAveragingEnabled,
    preferredGpsSourceId = GpsSourceSetting.auto,
  } = settings;

  const locationWatchTimeout = getLocationWatchTimeout({ settings });

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
        watchingLocation: false,
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

  const startLocationWatch = useCallback(async () => {
    log.debug("Starting location watch");

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
      if (!(await Permissions.requestBluetoothPermissions())) {
        return;
      }
    } else if (!(await Permissions.requestLocationForegroundPermission())) {
      if (!(await Permissions.isLocationServiceEnabled())) {
        toaster("device:locationServiceDisabled.warning");
      }
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
        locationSubscriptionRef.current = await ExternalGpsService.watchPosition(
          { sourceId: resolvedSourceId },
          (locationPoint) => locationCallback(locationPoint),
        );
        started = true;
      } catch (error) {
        log.warn(
          `Location watch: external GPS source ${resolvedSourceId} unavailable, falling back to internal GPS for this session`,
          error,
        );
        toaster("device:externalGps.unavailable.warning");
        sourceUnavailable = true;
        activeSourceId = internalGpsSourceId;
        started = await startInternalGpsWatch();
      }
    } else {
      log.debug("Location watch: starting with internal GPS");
      started = await startInternalGpsWatch();
    }

    if (!started) return;

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
      watchingLocation: true,
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
};
