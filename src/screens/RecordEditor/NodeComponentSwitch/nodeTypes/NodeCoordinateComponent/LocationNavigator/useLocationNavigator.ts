import { useCallback, useEffect, useMemo, useState } from "react";

import { Numbers, Objects, Points } from "@openforis/arena-core";

import {
  useLocationHeading,
  useLocationWatch,
  useMagnetometerHeading,
} from "hooks";
import { HeadingSource } from "hooks/headingUtils";
import { LocationPoint } from "model";
import { SurveySelectors } from "state";

import {
  getRelativeAngleColor,
  PROXIMITY_THRESHOLD_METRES,
} from "./locationNavigatorConstants";

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

  const [headingSource, setHeadingSource] = useState<HeadingSource>("magnetometer");

  const { heading: magHeading, magnetometerAvailable } = useMagnetometerHeading({
    enabled: headingSource === "magnetometer",
  });
  const { heading: locHeading, locationHeadingAvailable } = useLocationHeading({
    enabled: headingSource === "location",
  });

  const heading = headingSource === "magnetometer" ? magHeading : locHeading;
  const headingSourceAvailable =
    headingSource === "magnetometer" ? magnetometerAvailable : locationHeadingAvailable;

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

  const arrowColor = useMemo(
    () => getRelativeAngleColor(relativeAngle),
    [relativeAngle],
  );

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
    headingSource,
    headingSourceAvailable,
    isProximity,
    onUseCurrentLocationPress,
    relativeAngle,
    setHeadingSource,
    targetCoordDisplay,
  };
};
