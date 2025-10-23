import { useCallback, useEffect, useState } from "react";
import { Dimensions, Image } from "react-native";
import { useTheme } from "react-native-paper";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import { Objects, Points } from "@openforis/arena-core";

// @ts-expect-error TS(2307): Cannot find module 'hooks' or its corresponding ty... Remove this comment to see the full error message
import { useLocationWatch, useMagnetometerHeading } from "hooks";
// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
import { Button, FormItem, HView, Modal, Text, View, VView } from "components";
// @ts-expect-error TS(2307): Cannot find module 'state' or its corresponding ty... Remove this comment to see the full error message
import { SurveySelectors } from "state";
// @ts-expect-error TS(2307): Cannot find module 'utils' or its corresponding ty... Remove this comment to see the full error message
import { SystemUtils } from "utils";

import styles from "./locationNavigatorStyles";

const compassBgBlack = require(`../../../../../../assets/compass_bg_black.png`);
const compassBgWhite = require(`../../../../../../assets/compass_bg_white.png`);
const arrowUpGreen = require("../../../../../../assets/arrow_up_green.png");
const arrowUpOrange = require("../../../../../../assets/arrow_up_orange.png");
const arrowUpRed = require("../../../../../../assets/arrow_up_red.png");
const circleGreen = require("../../../../../../assets/circle_green.png");

const arrowToTargetVisibleDistanceThreshold = 30;
const Symbols = {
  degree: "\u00b0",
};

const { height, width } = Dimensions.get("window");

const compassImageSize = width - 40;
const arrowToTargetHeight = compassImageSize * 0.7;
const targetLocationBoxWidth = compassImageSize * 0.7;
const targetLocationMarkerHeight = height / 26;

const compassWrapperStyle = {
  height: compassImageSize,
  width: compassImageSize,
};

const targetLocationMarkerStyle = {
  alignSelf: "center",
  height: targetLocationMarkerHeight,
  resizeMode: "contain",
};

const getArrowImageByAngle = (angle: any) => {
  if (angle <= 20 || 360 - angle <= 20) return arrowUpGreen;
  if (angle <= 45 || 360 - angle <= 45) return arrowUpOrange;
  return arrowUpRed;
};

const radsToDegrees = (rads: any) => {
  let degrees = rads * (180 / Math.PI);
  degrees = -(degrees + 90);
  while (degrees < 0) degrees += 360;
  return degrees;
};

const calculateAngleBetweenPoints = (point1: any, point2: any) => {
  const angleRads = Math.atan2(point1.y - point2.y, point1.x - point2.x);
  return radsToDegrees(angleRads);
};

const formatNumber = (num: any, decimals = 2, unit = "") =>
  Objects.isEmpty(num) ? "-" : num.toFixed(decimals) + unit;

export const LocationNavigator = (props: any) => {
  const { targetPoint, onDismiss, onUseCurrentLocation } = props;

  if (__DEV__) {
    console.log(`rendering LocationNavigator`);
  }

  const theme = useTheme();

  const [state, setState] = useState({
    currentLocation: null,
    angleToTarget: 0,
    accuracy: 0,
    distance: 0,
  });

  const compassBg = theme.dark ? compassBgWhite : compassBgBlack;

  const srsIndex = SurveySelectors.useCurrentSurveySrsIndex();

  const updateState = useCallback((params: any) => {
    if (__DEV__) {
      console.log("LocationNavigator: updateState");
    }
    setState((statePrev) => ({ ...statePrev, ...params }));
  }, []);

  const locationCallback = useCallback(
    ({
      location,
      locationAccuracy,
      pointLatLong
    }: any) => {
      if (__DEV__) {
        console.log(`LocationNavigator location callback`, location);
      }
      if (!location) return;
      const angleToTargetNew = calculateAngleBetweenPoints(
        pointLatLong,
        targetPoint
      );
      const distanceNew = Points.distance(pointLatLong, targetPoint, srsIndex);
      updateState({
        currentLocation: location,
        angleToTarget: angleToTargetNew,
        accuracy: locationAccuracy,
        distance: distanceNew,
      });
    },
    [srsIndex, targetPoint, updateState]
  );

  const { startLocationWatch, stopLocationWatch } = useLocationWatch({
    locationCallback,
    stopOnAccuracyThreshold: false,
    stopOnTimeout: false,
  });

  const { heading, magnetometerAvailable } = useMagnetometerHeading();

  const { currentLocation, angleToTarget, accuracy, distance } = state;
  const { longitude: currentLocationX, latitude: currentLocationY } =
    // @ts-expect-error TS(2339): Property 'coords' does not exist on type 'never'.
    currentLocation?.coords || {};

  const arrowToTargetVisible =
    distance >= arrowToTargetVisibleDistanceThreshold;

  const targetLocationBoxWidthAdjusted =
    targetLocationBoxWidth *
    (arrowToTargetVisible
      ? 1
      : distance / arrowToTargetVisibleDistanceThreshold);

  const targetLocationBoxMargin =
    (compassImageSize -
      targetLocationBoxWidth +
      (targetLocationBoxWidth - targetLocationBoxWidthAdjusted)) /
    2;

  let angleToTargetDifference = angleToTarget - heading;
  if (angleToTargetDifference < 0) angleToTargetDifference += 360;

  const arrowToTargetSource = getArrowImageByAngle(angleToTargetDifference);

  useEffect(() => {
    startLocationWatch();
    SystemUtils.lockOrientationToPortrait();

    return () => {
      stopLocationWatch();
      SystemUtils.unlockOrientation();
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
      <VView style={styles.container}>
        {!magnetometerAvailable && (
          <Text
            textKey="dataEntry:coordinate.magnetometerNotAvailable"
            variant="labelMedium"
          />
        )}
        <VView style={styles.compassContainer}>
          {/* <Image
        source={compassPointer}
        style={{
          alignSelf: "center",
          height: height / 26,
          resizeMode: "contain",
        }}
      /> */}

          <View style={compassWrapperStyle}>
            <Image
              source={compassBg}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                height: compassImageSize,
                width: compassImageSize,
                resizeMode: "contain",
                transform: [{ rotate: `${360 - heading} deg` }],
              }}
            />
            {arrowToTargetVisible && (
              <Image
                source={arrowToTargetSource}
                style={{
                  position: "absolute",
                  top: (compassImageSize - arrowToTargetHeight) / 2,
                  height: arrowToTargetHeight,
                  transform: [{ rotate: angleToTargetDifference + "deg" }],
                  resizeMode: "contain",
                  alignSelf: "center",
                }}
              />
            )}
            {!arrowToTargetVisible && (
              <View
                style={{
                  backgroundColor: "transparent",
                  width: targetLocationBoxWidthAdjusted,
                  height: targetLocationBoxWidthAdjusted,
                  position: "absolute",
                  top: targetLocationBoxMargin,
                  left: targetLocationBoxMargin,
                  transform: [{ rotate: angleToTargetDifference + "deg" }],
                }}
              >
                // @ts-expect-error TS(2769): No overload matches this call.
                <Image source={circleGreen} style={targetLocationMarkerStyle} />
              </View>
            )}
          </View>

          <HView style={styles.fieldsRow}>
            <FormItem labelKey="dataEntry:coordinate.accuracy">
              {formatNumber(accuracy, undefined, "m")}
            </FormItem>
            <FormItem labelKey="dataEntry:coordinate.distance">
              {formatNumber(distance, undefined, "m")}
            </FormItem>
          </HView>
          <HView style={styles.fieldsRow}>
            <FormItem labelKey="dataEntry:coordinate.heading">
              {formatNumber(heading, 1, Symbols.degree)}
            </FormItem>
            <FormItem labelKey="dataEntry:coordinate.angleToTargetLocation">
              {formatNumber(angleToTarget, 0, Symbols.degree)}
            </FormItem>
          </HView>
          <FormItem labelKey="dataEntry:coordinate.currentLocation">
            {`${formatNumber(currentLocationX, 5)}, ${formatNumber(
              currentLocationY,
              5
            )}`}
          </FormItem>
        </VView>
        <HView style={styles.bottomBar}>
          <Button
            disabled={!currentLocation}
            onPress={onUseCurrentLocationPress}
            textKey="dataEntry:coordinate.useCurrentLocation"
          />
        </HView>
      </VView>
    </Modal>
  );
};

LocationNavigator.propTypes = {
  targetPoint: PropTypes.object.isRequired,
  onDismiss: PropTypes.func.isRequired,
  onUseCurrentLocation: PropTypes.func.isRequired,
};
