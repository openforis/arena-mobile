import { useCallback, useEffect, useMemo, useState } from "react";

import { Numbers, Objects, Points } from "@openforis/arena-core";

import { useLocationWatch, useMagnetometerHeading } from "hooks";
import { LocationPoint } from "model";
import { SurveySelectors } from "state";

import { PROXIMITY_THRESHOLD_METRES } from "./locationNavigatorConstants";

const arrowToTargetVisibleDistanceThreshold = PROXIMITY_THRESHOLD_METRES;

type NavigatorState = {
  currentLocation: LocationPoint | null;
  angleToTarget: number;
  accuracy: number | null;
  distance: number;
};

const initialState: NavigatorState = {
  currentLocation: null,
  angleToTarget: 0,
  accuracy: null,
  distance: Infinity,
};

type UseLocationNavigatorProps = {
  targetPoint: any;
  onDismiss: () => void;
  onUseCurrentLocation: (location: any) => void;
};

export const useLocationNavigator = ({
  targetPoint,
  onDismiss,
  onUseCurrentLocation,
}: UseLocationNavigatorProps) => {
  const srsIndex = SurveySelectors.useCurrentSurveySrsIndex();

  const targetPointLatLong = useMemo(
    () =>
      targetPoint && srsIndex ? Points.toLatLong(targetPoint, srsIndex) : null,
    [targetPoint, srsIndex],
  );

  const [state, setState] = useState<NavigatorState>(initialState);

  const locationCallback = useCallback(
    ({ location, locationAccuracy, pointLatLong }: any) => {
      if (!location) return;
      const angleToTargetNew =
        Points.bearing(pointLatLong, targetPoint, srsIndex) ?? 0;
      const distanceNew =
        Points.distance(pointLatLong, targetPoint, srsIndex) ?? Infinity;
      setState((prev) => ({
        ...prev,
        currentLocation: location,
        angleToTarget: angleToTargetNew,
        accuracy: locationAccuracy,
        distance: distanceNew,
      }));
    },
    [srsIndex, targetPoint],
  );

  const { startLocationWatch, stopLocationWatch } = useLocationWatch({
    locationCallback,
    stopOnAccuracyThreshold: false,
    stopOnTimeout: false,
  });

  const { heading, magnetometerAvailable } = useMagnetometerHeading();

  useEffect(() => {
    startLocationWatch();
    return () => {
      stopLocationWatch();
    };
  }, [startLocationWatch, stopLocationWatch]);

  const { currentLocation, angleToTarget, accuracy, distance } = state;

  const relativeAngle = useMemo(
    () => Numbers.absMod(360)(angleToTarget - heading),
    [angleToTarget, heading],
  );

  const isProximity = distance < arrowToTargetVisibleDistanceThreshold;

  const arrowColor = useMemo(() => {
    if (relativeAngle <= 20 || relativeAngle >= 340) return "#4caf50";
    if (relativeAngle <= 45 || relativeAngle >= 315) return "#ff9800";
    return "#f44336";
  }, [relativeAngle]);

  const targetCoordDisplay = useMemo(() => {
    if (!targetPointLatLong) return null;
    const { x, y } = targetPointLatLong;
    return Objects.isEmpty(x) || Objects.isEmpty(y)
      ? null
      : `${(x as number).toFixed(5)}, ${(y as number).toFixed(5)}`;
  }, [targetPointLatLong]);

  const currentCoordDisplay = useMemo(() => {
    if (!currentLocation) return "-";
    const { longitude, latitude } = currentLocation;
    return `${longitude.toFixed(5)}, ${latitude.toFixed(5)}`;
  }, [currentLocation]);

  const onUseCurrentLocationPress = useCallback(() => {
    onUseCurrentLocation(currentLocation);
    onDismiss();
  }, [currentLocation, onDismiss, onUseCurrentLocation]);

  return {
    accuracy,
    angleToTarget,
    arrowColor,
    currentCoordDisplay,
    currentLocation,
    distance,
    heading,
    isProximity,
    magnetometerAvailable,
    onUseCurrentLocationPress,
    relativeAngle,
    targetCoordDisplay,
  };
};
