import { useMemo } from "react";
import { Image } from "react-native";

import { Numbers } from "@openforis/arena-core";

import { View } from "components";
import { useMinScreenDimension } from "hooks";
import { DeviceInfoSelectors } from "state";
import {
  arrowToTargetVisibleDistanceThreshold,
  useCompassColors,
  useCompassStylesAndSizes,
} from "./useCompassStylesAndSizes";

const assetsPath = "../../../../../../assets";

const arrowUpGreen = require(`${assetsPath}/arrow_up_green.png`);
const arrowUpOrange = require(`${assetsPath}/arrow_up_orange.png`);
const arrowUpRed = require(`${assetsPath}/arrow_up_red.png`);
const circleGreen = require(`${assetsPath}/circle_green.png`);

const getArrowImageByAngle = (angle: number) => {
  if (angle <= 20 || 360 - angle <= 20) {
    // within 20 degrees: close to target
    return arrowUpGreen;
  }
  if (angle <= 45 || 360 - angle <= 45) {
    // within 45 degrees: somewhat close to target
    return arrowUpOrange;
  }
  // far from target
  return arrowUpRed;
};

type CompassViewProps = {
  distance: number;
  heading: number;
  angleToTarget: number;
};

export const CompassView = (props: CompassViewProps) => {
  const { angleToTarget, distance, heading } = props;

  const minDimension = useMinScreenDimension();
  const landscapeOrientation = DeviceInfoSelectors.useOrientationIsLandscape();

  const { compassBg, bearingTriangleColor, centerCrossColor } =
    useCompassColors();

  const arrowToTargetVisible =
    distance >= arrowToTargetVisibleDistanceThreshold;

  const arrowToTargetAngle = useMemo(
    () => Numbers.absMod(360)(angleToTarget - heading),
    [angleToTarget, heading],
  );

  const dynamicStylesAndSizes = useCompassStylesAndSizes({
    angleToTarget,
    arrowToTargetVisible,
    bearingTriangleColor,
    centerCrossColor,
    distance,
    heading,
    landscapeOrientation,
    minDimension,
  });

  const { dynamicStyles, sizes } = dynamicStylesAndSizes;
  const { compassImageSize, arrowToTargetHeight } = sizes;

  const arrowToTargetSource = getArrowImageByAngle(arrowToTargetAngle);

  return (
    <View style={dynamicStyles.compassWrapper}>
      {/* compass background, rotated according to device heading */}
      <Image source={compassBg} style={dynamicStyles.compassBackground} />
      {/* bearing triangles */}
      <View
        style={[
          dynamicStyles.bearingTriangle,
          dynamicStyles.bearingTriangleTop,
        ]}
      />
      <View
        style={[
          dynamicStyles.bearingTriangle,
          dynamicStyles.bearingTriangleBottom,
        ]}
      />
      {arrowToTargetVisible && (
        // arrow pointing to target location (rotated according to angle to target and device heading)
        <Image
          source={arrowToTargetSource}
          style={{
            position: "absolute",
            top: (compassImageSize - arrowToTargetHeight) / 2,
            height: arrowToTargetHeight,
            transform: [{ rotate: arrowToTargetAngle + "deg" }],
            resizeMode: "contain",
            alignSelf: "center",
          }}
        />
      )}
      {!arrowToTargetVisible && (
        // target location indicator (green circle)
        <View style={dynamicStyles.targetLocationMarkerWrapper}>
          <Image
            source={circleGreen}
            style={dynamicStyles.targetLocationMarker}
          />
        </View>
      )}
      {!arrowToTargetVisible && distance > 5 && (
        // center cross
        <View style={dynamicStyles.centerCross}>
          <View style={dynamicStyles.centerCrossHorizontal} />
          <View style={dynamicStyles.centerCrossVertical} />
        </View>
      )}
    </View>
  );
};
