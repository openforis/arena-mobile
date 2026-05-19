import { useMemo } from "react";
import { Dimensions, Image, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";

import { Numbers } from "@openforis/arena-core";

import { View } from "components";
import { DeviceInfoSelectors } from "state";
import { ColorUtils } from "utils";

const assetsPath = "../../../../../../assets";
const compassBgBlack = require(`${assetsPath}/compass_bg_black.png`);
const compassBgWhite = require(`${assetsPath}/compass_bg_white.png`);
const arrowUpGreen = require(`${assetsPath}/arrow_up_green.png`);
const arrowUpOrange = require(`${assetsPath}/arrow_up_orange.png`);
const arrowUpRed = require(`${assetsPath}/arrow_up_red.png`);
const circleGreen = require(`${assetsPath}/circle_green.png`);

const arrowToTargetVisibleDistanceThreshold = 30;

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

const { height, width } = Dimensions.get("window");
const minDimension = Math.min(height, width);

type CompassViewProps = {
  distance: number;
  heading: number;
  angleToTarget: number;
};

export const CompassView = (props: CompassViewProps) => {
  const { angleToTarget, distance, heading } = props;

  const theme = useTheme();
  const landscapeOrientation = DeviceInfoSelectors.useOrientationIsLandscape();

  const compassBg = theme.dark ? compassBgWhite : compassBgBlack;
  const bearingTriangleColor = ColorUtils.withOpacity(
    theme.colors.primary,
    0.6,
  );
  const centerCrossColor = ColorUtils.withOpacity(theme.colors.onSurface, 0.7);

  const arrowToTargetVisible =
    distance >= arrowToTargetVisibleDistanceThreshold;

  const arrowToTargetAngle = Numbers.absMod(360)(angleToTarget - heading);

  const dynamicStylesAndSizes = useMemo(() => {
    const compassImageSize = landscapeOrientation
      ? minDimension - 110
      : minDimension - 40;
    const bearingTriangleSize = compassImageSize * 0.042;
    const bearingTriangleInset = compassImageSize * 0.014;

    const targetLocationMarkerHeight = compassImageSize / 16;

    const targetLocationBoxWidth = compassImageSize * 0.7;

    const targetLocationBoxWidthAdjusted =
      targetLocationBoxWidth *
      (arrowToTargetVisible
        ? 1
        : distance / arrowToTargetVisibleDistanceThreshold);

    return {
      sizes: {
        compassImageSize,
        arrowToTargetHeight: compassImageSize * 0.7,
        bearingTriangleInset,
        bearingTriangleSize,
        targetLocationBoxWidth,
        targetLocationMarkerHeight,
        targetLocationBoxMargin:
          (compassImageSize -
            targetLocationBoxWidth +
            (targetLocationBoxWidth - targetLocationBoxWidthAdjusted)) /
          2,
        targetLocationBoxWidthAdjusted,
      },
      dynamicStyles: StyleSheet.create({
        compassWrapper: {
          height: compassImageSize,
          width: compassImageSize,
        },
        centerCross: {
          position: "absolute",
          top: (compassImageSize - 10) / 2,
          left: (compassImageSize - 10) / 2,
          width: 10,
          height: 10,
          alignItems: "center",
          justifyContent: "center",
        },
        centerCrossHorizontal: {
          position: "absolute",
          width: 10,
          height: 1.5,
          borderRadius: 1,
          backgroundColor: centerCrossColor,
        },
        centerCrossVertical: {
          position: "absolute",
          width: 1.5,
          height: 10,
          borderRadius: 1,
          backgroundColor: centerCrossColor,
        },
        bearingTriangle: {
          position: "absolute",
          alignSelf: "center",
          width: 0,
          height: 0,
          backgroundColor: "transparent",
          borderLeftWidth: bearingTriangleSize,
          borderRightWidth: bearingTriangleSize,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
        },
        bearingTriangleTop: {
          top: bearingTriangleInset,
          borderBottomWidth: bearingTriangleSize * 1.2,
          borderBottomColor: bearingTriangleColor,
        },
        bearingTriangleBottom: {
          bottom: bearingTriangleInset,
          borderTopWidth: bearingTriangleSize * 1.2,
          borderTopColor: bearingTriangleColor,
        },
        targetLocationMarker: {
          alignSelf: "center",
          height: targetLocationMarkerHeight,
          resizeMode: "contain",
        },
      }),
    };
  }, [
    arrowToTargetVisible,
    distance,
    landscapeOrientation,
    bearingTriangleColor,
    centerCrossColor,
  ]);

  const { dynamicStyles, sizes } = dynamicStylesAndSizes;
  const {
    compassImageSize,
    arrowToTargetHeight,
    targetLocationBoxWidthAdjusted,
    targetLocationBoxMargin,
  } = sizes;

  const arrowToTargetSource = getArrowImageByAngle(angleToTarget);

  return (
    <View style={dynamicStyles.compassWrapper}>
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
        // arrow pointing to target location
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
        <View
          style={{
            backgroundColor: "transparent",
            width: targetLocationBoxWidthAdjusted,
            height: targetLocationBoxWidthAdjusted,
            position: "absolute",
            top: targetLocationBoxMargin,
            left: targetLocationBoxMargin,
            transform: [{ rotate: angleToTarget + "deg" }],
          }}
        >
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
