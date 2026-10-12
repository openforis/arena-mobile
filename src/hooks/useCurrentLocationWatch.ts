import { useCallback, useEffect, useState } from "react";

import { LatLng, LocationPoint } from "model";

import { useLocationWatch } from "./useLocationWatch";

export type CurrentLocation = LatLng & { accuracy?: number | null };

// keeps watching the current location while the component is mounted (e.g. to show it on a map)
export const useCurrentLocationWatch = (): CurrentLocation | null => {
  const [currentLocation, setCurrentLocation] =
    useState<CurrentLocation | null>(null);

  const onLocation = useCallback(
    ({ location }: { location: LocationPoint | null }) => {
      if (!location) return;
      setCurrentLocation({
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
      });
    },
    [],
  );

  const { startLocationWatch, stopLocationWatch } = useLocationWatch({
    locationCallback: onLocation,
    stopOnAccuracyThreshold: false,
    stopOnTimeout: false,
  });

  useEffect(() => {
    void startLocationWatch();
    return () => stopLocationWatch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return currentLocation;
};
