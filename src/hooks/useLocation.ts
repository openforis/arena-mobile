import { useCallback, useEffect, useState } from "react";
import { Point } from "@openforis/arena-core";

import { LocationPoint } from "model";
import { useLocationWatch } from "./useLocationWatch";
import type { LocationWatchStatus } from "./useLocationWatch";

const defaultState = {
  location: null,
  locationAccuracy: null,
  locationFetched: false,
  pointLatLong: null,
};

export const useLocation = (): {
  location: LocationPoint | null;
  locationAccuracy: number | null;
  locationAccuracyThreshold: number;
  locationFetched: boolean;
  locationWatchStatus: LocationWatchStatus;
  locationWatchElapsedTime: number;
  locationWatchProgress: number;
  locationWatchTimeout: number;
  pointLatLong: Point | null;
  startLocationWatch: () => void;
  stopLocationWatch: () => void;
  watchingLocation: boolean;
} => {
  const [state, setState] = useState(defaultState);

  const { location, locationAccuracy, locationFetched, pointLatLong } = state;

  const locationCallback = useCallback(
    ({ location, locationAccuracy, pointLatLong, thresholdReached }: any) => {
      if (thresholdReached) {
        setState((statePrev) => ({
          ...statePrev,
          locationAccuracy,
          locationFetched: true,
          location,
          pointLatLong,
        }));
      } else {
        setState((statePrev) => ({
          ...statePrev,
          locationAccuracy,
        }));
      }
    },
    [],
  );

  const {
    locationAccuracyThreshold,
    locationWatchElapsedTime,
    locationWatchProgress,
    locationWatchTimeout,
    locationWatchStatus,
    startLocationWatch,
    stopLocationWatch,
    watchingLocation,
  } = useLocationWatch({ locationCallback });

  useEffect(() => {
    startLocationWatch();

    return () => {
      stopLocationWatch();
    };
  }, [startLocationWatch, stopLocationWatch]);

  return {
    location,
    locationAccuracy,
    locationAccuracyThreshold,
    locationFetched,
    locationWatchStatus,
    locationWatchElapsedTime,
    locationWatchProgress,
    locationWatchTimeout,
    pointLatLong,
    startLocationWatch,
    stopLocationWatch,
    watchingLocation,
  };
};
