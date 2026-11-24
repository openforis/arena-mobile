import { useCallback, useEffect, useState } from "react";
import { ArenaPoint } from "@openforis/arena-core";

import { LocationPoint } from "model";
import { useLocationWatch } from "./useLocationWatch";
import type { LocationWatchStatus } from "./useLocationWatch";

type LocationCallbackParams = Parameters<
  Parameters<typeof useLocationWatch>[0]["locationCallback"]
>[0];

type LocationState = {
  location: LocationPoint | null;
  locationAccuracy: number | null | undefined;
  locationFetched: boolean;
  pointLatLong: ArenaPoint | null;
};

const defaultState: LocationState = {
  location: null,
  locationAccuracy: null,
  locationFetched: false,
  pointLatLong: null,
};

export const useLocation = (): {
  location: LocationPoint | null;
  locationAccuracy: number | null | undefined;
  locationAccuracyThreshold: number;
  locationFetched: boolean;
  locationWatchStatus: LocationWatchStatus;
  locationWatchElapsedTime: number;
  locationWatchProgress: number;
  locationWatchTimeout: number;
  pointLatLong: ArenaPoint | null;
  startLocationWatch: () => void;
  stopLocationWatch: () => void;
  watchingLocation: boolean;
} => {
  const [state, setState] = useState(defaultState);

  const { location, locationAccuracy, locationFetched, pointLatLong } = state;

  const locationCallback = useCallback(
    ({
      location,
      locationAccuracy,
      pointLatLong,
      thresholdReached,
    }: LocationCallbackParams) => {
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
