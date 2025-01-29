import { useCallback, useRef, useState } from "react";
import * as Location from "expo-location";
import { PointFactory } from "@openforis/arena-core";

import { Permissions, Refs } from "utils";
import { SettingsSelectors } from "../state/settings";
import { useIsMountedRef } from "./useIsMountedRef";

const locationWatchElapsedTimeIntervalDelay = 1000;
const defaultLocationAccuracyThreshold = 4;
const defaultLocationAccuracyWatchTimeout = 120000; // 2 mins

const locationToPoint = (location) => {
  if (!location) return null;

  const { coords } = location;
  const { latitude, longitude } = coords;

  return PointFactory.createInstance({
    x: longitude,
    y: latitude,
  });
};

const getLocationWatchTimeout = ({ settings }) => {
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
}) => {
  const isMountedRef = useIsMountedRef();
  const lastLocationRef = useRef(null);
  const locationSubscriptionRef = useRef(null);
  const locationAccuracyWatchTimeoutRef = useRef(null);
  const locationWatchIntervalRef = useRef(null);

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
    const wasActive = !!locationSubscriptionRef.current;
    if (wasActive) {
      locationSubscriptionRef.current?.remove();
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
    (location) => {
      lastLocationRef.current = location; // location could be null when watch timeout is reached

      const { coords } = location ?? {};
      const { accuracy: locationAccuracy } = coords ?? {};

      const accuracyThresholdReached =
        locationAccuracy <= locationAccuracyThreshold;
      const timeoutReached =
        stopOnTimeout && locationSubscriptionRef.current === null;
      const thresholdReached = accuracyThresholdReached || timeoutReached;
      if (
        (stopOnAccuracyThreshold && accuracyThresholdReached) ||
        (stopOnTimeout && timeoutReached)
      ) {
        _stopLocationWatch();
      }
      const pointLatLong = locationToPoint(location);

      locationCallbackProp({
        location,
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
  }, [_stopLocationWatch, isMountedRef, locationCallback]);

  const startLocationWatch = useCallback(async () => {
    if (!(await Permissions.requestLocationForegroundPermission())) return;

    _stopLocationWatch();
    locationSubscriptionRef.current = await Location.watchPositionAsync(
      { accuracy, distanceInterval },
      locationCallback
    );

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
    locationWatchTimeout,
    stopOnTimeout,
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
