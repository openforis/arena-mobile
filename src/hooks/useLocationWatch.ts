import { useCallback, useRef, useState } from "react";
import * as Location from "expo-location";
import { Point, PointFactory } from "@openforis/arena-core";

import { LocationPoint } from "model";
import { log, Permissions, Refs } from "utils";
import { LocationAverager } from "utils/LocationAverageCalculator";
import { SettingsSelectors } from "../state/settings";
import { useIsMountedRef } from "./useIsMountedRef";
import { useToast } from "./useToast";

const locationWatchElapsedTimeIntervalDelay = 1000;
const defaultLocationAccuracyThreshold = 4;
const defaultLocationAccuracyWatchTimeout = 120000; // 2 mins
const minLocationReadingsForAccuracyThreshold = 5;

const locationPointToPoint = (locationPoint: LocationPoint): Point | null => {
  if (!locationPoint) return null;

  const { latitude, longitude } = locationPoint;

  return PointFactory.createInstance({
    x: longitude,
    y: latitude,
  });
};

const locationToLocationPoint = (
  location: Location.LocationObject
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
  const locationSubscriptionRef = useRef(
    null as Location.LocationSubscription | null
  );
  const locationAccuracyWatchTimeoutRef = useRef(null as number | null);
  const locationWatchIntervalRef = useRef(null as number | null);
  const locationAveragerRef = useRef(null as LocationAverager | null);
  const toaster = useToast();

  const settings = SettingsSelectors.useSettings();
  const { locationAccuracyThreshold = defaultLocationAccuracyThreshold } =
    settings;

  const locationWatchTimeout = getLocationWatchTimeout({ settings });

  const [state, setState] = useState({
    watchingLocation: false,
    locationWatchElapsedTime: 0,
    locationWatchProgress: 0,
  });

  const { locationWatchElapsedTime, locationWatchProgress, watchingLocation } =
    state;

  const clearLocationWatchTimeout = useCallback(() => {
    Refs.clearIntervalRef(locationWatchIntervalRef);
    Refs.clearTimeoutRef(locationAccuracyWatchTimeoutRef);
  }, []);

  const _stopLocationWatch = useCallback(() => {
    const subscription = locationSubscriptionRef.current;
    const wasActive = !!subscription;
    if (wasActive) {
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
    (locationPoint: LocationPoint | null) => {
      log.debug(`Location received in watch: ${JSON.stringify(locationPoint)}`);

      if (!locationPoint) {
        lastLocationRef.current = locationPoint; // location could be null when watch timeout is reached
        return;
      }
      const locationAverager = locationAveragerRef.current;
      if (!locationAverager) return;

      locationAverager.addReading(locationPoint);

      const lastAveragedLocation = locationAverager.calculateAveragedLocation();
      lastLocationRef.current = lastAveragedLocation;
      log.debug(`Averaged location: ${JSON.stringify(lastAveragedLocation)}`);

      if (!lastAveragedLocation) return;

      const { accuracy: locationAccuracy } = lastAveragedLocation;

      const accuracyThresholdReached =
        stopOnAccuracyThreshold &&
        locationAccuracy &&
        locationAccuracy <= locationAccuracyThreshold &&
        lastAveragedLocation.count > minLocationReadingsForAccuracyThreshold;
      log.debug(`accuracyThresholdReached: ${accuracyThresholdReached}`);
      const timeoutReached =
        stopOnTimeout && locationSubscriptionRef.current === null;
      log.debug(`timeoutReached: ${timeoutReached}`);
      const thresholdReached = accuracyThresholdReached || timeoutReached;
      if (thresholdReached) {
        log.debug("Threshold reached, stopping location watch");
        _stopLocationWatch();
      }
      const pointLatLong = locationPointToPoint(lastAveragedLocation);

      locationCallbackProp({
        location: lastAveragedLocation,
        locationAccuracy,
        pointLatLong,
        thresholdReached,
      });
    },
    [
      locationCallbackProp,
      locationAccuracyThreshold,
      stopOnAccuracyThreshold,
      stopOnTimeout,
      _stopLocationWatch,
    ]
  );

  const stopLocationWatch = useCallback(() => {
    if (_stopLocationWatch() && isMountedRef.current) {
      locationCallback(lastLocationRef.current);
    }
    lastLocationRef.current = null;
    locationAveragerRef.current = null;
  }, [_stopLocationWatch, isMountedRef, locationCallback]);

  const startLocationWatch = useCallback(async () => {
    log.debug("Starting location watch");

    if (!(await Permissions.requestLocationForegroundPermission())) {
      if (!(await Permissions.isLocationServiceEnabled())) {
        toaster("device:locationServiceDisabled.warning");
        return;
      }
    }
    _stopLocationWatch();

    locationSubscriptionRef.current = await Location.watchPositionAsync(
      { accuracy, distanceInterval },
      (location) => locationCallback(locationToLocationPoint(location))
    );
    locationAveragerRef.current = new LocationAverager();

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
        stopLocationWatch();
      }, locationWatchTimeout);
    }
    setState((statePrev) => ({ ...statePrev, watchingLocation: true }));
  }, [
    _stopLocationWatch,
    accuracy,
    distanceInterval,
    locationCallback,
    stopOnTimeout,
    toaster,
    locationWatchTimeout,
    stopLocationWatch,
  ]);

  return {
    locationAccuracyThreshold,
    locationWatchElapsedTime,
    locationWatchProgress,
    locationWatchTimeout,
    startLocationWatch,
    stopLocationWatch,
    watchingLocation,
  };
};
