import { useCallback, useEffect, useState } from "react";
import { Point } from "@openforis/arena-core";

import { LocationPoint } from "model";
import { useLocationWatch } from "./useLocationWatch";

const defaultState = {
  location: null,
  locationAccuracy: null,
  locationFetched: false,
  pointLatLong: null,
  watchingLocation: false,
};

export const useLocation = (): {
  location: LocationPoint | null;
  locationAccuracy: number | null;
  locationAccuracyThreshold: number;
  locationFetched: boolean;
  locationWatchElapsedTime: number;
  locationWatchProgress: number;
  locationWatchTimeout: number;
  pointLatLong: Point | null;
  startLocationWatch: () => void;
  stopLocationWatch: () => void;
  watchingLocation: boolean;
} => {
  const [state, setState] = useState(defaultState);

  const {
    location,
    locationAccuracy,
    locationFetched,
    pointLatLong,
    watchingLocation,
  } = state;

  const locationCallback = useCallback(
    ({ location, locationAccuracy, pointLatLong, thresholdReached }: any) => {
      if (thresholdReached) {
        setState((statePrev) => ({
          ...statePrev,
          locationAccuracy,
          locationFetched: true,
          location,
          pointLatLong,
          watchingLocation: false,
        }));
      } else {
        setState((statePrev) => ({
          ...statePrev,
          locationAccuracy,
        }));
      }
    },
    []
  );

  const {
    locationAccuracyThreshold,
    locationWatchElapsedTime,
    locationWatchProgress,
    locationWatchTimeout,
    startLocationWatch,
    stopLocationWatch,
  } = useLocationWatch({ locationCallback });

  useEffect(() => {
    startLocationWatch();
    setState((statePrev) => ({
      ...statePrev,
      ...defaultState,
      watchingLocation: true,
    }));

    return () => {
      stopLocationWatch();
    };
  }, [startLocationWatch, stopLocationWatch]);

  return {
    location,
    locationAccuracy,
    locationAccuracyThreshold,
    locationFetched,
    locationWatchElapsedTime,
    locationWatchProgress,
    locationWatchTimeout,
    pointLatLong,
    startLocationWatch,
    stopLocationWatch,
    watchingLocation,
  };
};
