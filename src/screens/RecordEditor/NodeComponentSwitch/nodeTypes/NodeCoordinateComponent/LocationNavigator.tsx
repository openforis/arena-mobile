import { useCallback, useEffect, useMemo, useState } from "react";

import { Objects, Points } from "@openforis/arena-core";

import {
  Button,
  FlexWrapView,
  FormItem,
  HView,
  Modal,
  Text,
  VView,
} from "components";
import { useLocationWatch, useMagnetometerHeading } from "hooks";
import { LocationPoint } from "model";
import { SurveySelectors } from "state";
import { log } from "utils";

import { CompassView } from "./CompassView";
import styles from "./locationNavigatorStyles";

const Symbols = {
  degree: "\u00b0",
};

const formatNumber = (num: any, decimals = 2, unit = "") =>
  Objects.isEmpty(num) ? "-" : num.toFixed(decimals) + unit;

type LocationNavigatorState = {
  currentLocation?: LocationPoint | null;
  angleToTarget: 0;
  accuracy: 0;
  distance: 0;
};

const initialState: LocationNavigatorState = {
  currentLocation: null,
  angleToTarget: 0,
  accuracy: 0,
  distance: 0,
};

type LocationNavigatorProps = {
  targetPoint: any;
  onDismiss: () => void;
  onUseCurrentLocation: (location: any) => void;
};

export const LocationNavigator = (props: LocationNavigatorProps) => {
  const { targetPoint, onDismiss, onUseCurrentLocation } = props;

  log.debug(`rendering LocationNavigator`);

  const srsIndex = SurveySelectors.useCurrentSurveySrsIndex();

  const targetPointLatLong = useMemo(
    () =>
      targetPoint && srsIndex ? Points.toLatLong(targetPoint, srsIndex) : null,
    [targetPoint, srsIndex],
  );

  const [state, setState] = useState(initialState);

  const updateState = useCallback((params: any) => {
    log.debug("LocationNavigator: updateState");
    setState((statePrev) => ({ ...statePrev, ...params }));
  }, []);

  const locationCallback = useCallback(
    ({ location, locationAccuracy, pointLatLong }: any) => {
      if (!location) return;
      const angleToTargetNew = Points.bearing(
        pointLatLong,
        targetPoint,
        srsIndex,
      );
      const distanceNew = Points.distance(pointLatLong, targetPoint, srsIndex);
      updateState({
        currentLocation: location,
        angleToTarget: angleToTargetNew,
        accuracy: locationAccuracy,
        distance: distanceNew,
      });
    },
    [srsIndex, targetPoint, updateState],
  );

  const { startLocationWatch, stopLocationWatch } = useLocationWatch({
    locationCallback,
    stopOnAccuracyThreshold: false,
    stopOnTimeout: false,
  });

  const { heading, magnetometerAvailable } = useMagnetometerHeading();

  const { currentLocation, angleToTarget, accuracy, distance } = state;
  const { longitude: currentLocationX, latitude: currentLocationY } =
    currentLocation ?? {};

  useEffect(() => {
    startLocationWatch();

    return () => {
      stopLocationWatch();
    };
  }, [startLocationWatch, stopLocationWatch]);

  const onUseCurrentLocationPress = useCallback(() => {
    onUseCurrentLocation(currentLocation);
    onDismiss();
  }, [currentLocation, onDismiss, onUseCurrentLocation]);

  return (
    <Modal
      onDismiss={onDismiss}
      titleKey="dataEntry:coordinate.navigateToTarget"
    >
      <FlexWrapView style={styles.container}>
        {!magnetometerAvailable && (
          <Text
            textKey="dataEntry:coordinate.magnetometerNotAvailable"
            variant="labelMedium"
          />
        )}
        <FlexWrapView style={styles.compassContainer}>
          <CompassView
            distance={distance}
            heading={heading}
            angleToTarget={angleToTarget}
          />
          <VView fullFlex>
            <FormItem labelKey="dataEntry:coordinate.heading">
              {formatNumber(heading, 1, Symbols.degree)}
            </FormItem>
            {targetPointLatLong && (
              <FormItem labelKey="dataEntry:coordinate.targetLocation">
                {`${formatNumber(targetPointLatLong.x, 5)}, ${formatNumber(targetPointLatLong.y, 5)}`}
              </FormItem>
            )}
            <HView style={styles.fieldsRow}>
              <FormItem labelKey="dataEntry:coordinate.angleToTargetLocation">
                {formatNumber(angleToTarget, 0, Symbols.degree)}
              </FormItem>
              <FormItem labelKey="dataEntry:coordinate.distance">
                {formatNumber(distance, undefined, "m")}
              </FormItem>
            </HView>

            <FormItem labelKey="dataEntry:coordinate.currentLocation">
              {`${formatNumber(currentLocationX, 5)}, ${formatNumber(currentLocationY, 5)}`}
            </FormItem>
            <FormItem labelKey="dataEntry:coordinate.accuracy">
              {formatNumber(accuracy, undefined, "m")}
            </FormItem>

            <HView style={styles.bottomBar}>
              <Button
                disabled={!currentLocation}
                onPress={onUseCurrentLocationPress}
                textKey="dataEntry:coordinate.useCurrentLocation"
              />
            </HView>
          </VView>
        </FlexWrapView>
      </FlexWrapView>
    </Modal>
  );
};
