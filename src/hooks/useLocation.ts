import { useCallback, useEffect, useState } from "react";
import { useLocationWatch } from "./useLocationWatch";

const defaultState = {
  location: null,
  locationAccuracy: null,
  locationFetched: false,
  pointLatLong: null,
  wathingLocation: false,
};

export const useLocation = () => {
  const [state, setState] = useState(defaultState);

  const {
    location,
    locationAccuracy,
    locationFetched,
    pointLatLong,
    wathingLocation,
  } = state;

  const locationCallback = useCallback(
    ({ location, locationAccuracy, pointLatLong, thresholdReached }) => {
      if (thresholdReached) {
        setState((statePrev) => ({
          ...statePrev,
          locationAccuracy,
          locationFetched: true,
          location,
          pointLatLong,
          wathingLocation: false,
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
      wathingLocation: true,
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
    wathingLocation,
  };
};
