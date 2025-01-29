import { useCallback, useEffect, useState } from "react";
import { Dimensions, Image } from "react-native";
import { useTheme } from "react-native-paper";
import PropTypes from "prop-types";

import { Objects, Points } from "@openforis/arena-core";

import { useLocationWatch, useMagnetometerHeading } from "hooks";
import { Button, FormItem, HView, Modal, Text, View, VView } from "components";
import { SurveySelectors } from "state";
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

const getArrowImageByAngle = (angle) => {
  if (angle <= 20 || 360 - angle <= 20) return arrowUpGreen;
  if (angle <= 45 || 360 - angle <= 45) return arrowUpOrange;
  return arrowUpRed;
};

const radsToDegrees = (rads) => {
  let degrees = rads * (180 / Math.PI);
  degrees = -(degrees + 90);
  while (degrees < 0) degrees += 360;
  return degrees;
};

const calculateAngleBetweenPoints = (point1, point2) => {
  const angleRads = Math.atan2(point1.y - point2.y, point1.x - point2.x);
  return radsToDegrees(angleRads);
};

const formatNumber = (num, decimals = 2, unit = "") =>
  Objects.isEmpty(num) ? "-" : num.toFixed(decimals) + unit;

export const LocationNavigator = (props) => {
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

  const updateState = useCallback((params) => {
    if (__DEV__) {
      console.log("LocationNavigator: updateState");
    }
    setState((statePrev) => ({ ...statePrev, ...params }));
  }, []);

  const locationCallback = useCallback(
    ({ location, locationAccuracy, pointLatLong }) => {
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
