import { useMemo } from "react";
import { Dimensions, Image, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";

import { View } from "components";
import { DeviceInfoSelectors } from "state";

const assetsPath = "../../../../../../assets";
const compassBgBlack = require(`${assetsPath}/compass_bg_black.png`);
const compassBgWhite = require(`${assetsPath}/compass_bg_white.png`);
const arrowUpGreen = require(`${assetsPath}/arrow_up_green.png`);
const arrowUpOrange = require(`${assetsPath}/arrow_up_orange.png`);
const arrowUpRed = require(`${assetsPath}/arrow_up_red.png`);
const circleGreen = require(`${assetsPath}/circle_green.png`);

const arrowToTargetVisibleDistanceThreshold = 30;

const getArrowImageByAngle = (angle: number) => {
  if (angle <= 20 || 360 - angle <= 20) return arrowUpGreen;
  if (angle <= 45 || 360 - angle <= 45) return arrowUpOrange;
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

  const arrowToTargetVisible =
    distance >= arrowToTargetVisibleDistanceThreshold;

  const dynamicStylesAndSizes = useMemo(() => {
    const compassImageSize = landscapeOrientation
      ? minDimension - 110
      : minDimension - 40;

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
        targetLocationMarker: {
          alignSelf: "center",
          height: targetLocationMarkerHeight,
          resizeMode: "contain",
        },
      }),
    };
  }, [arrowToTargetVisible, distance, landscapeOrientation]);

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
      {arrowToTargetVisible && (
        <Image
          source={arrowToTargetSource}
          style={{
            position: "absolute",
            top: (compassImageSize - arrowToTargetHeight) / 2,
            height: arrowToTargetHeight,
            transform: [{ rotate: angleToTarget + "deg" }],
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
            transform: [{ rotate: angleToTarget + "deg" }],
          }}
        >
          <Image
            source={circleGreen}
            style={dynamicStyles.targetLocationMarker}
          />
        </View>
      )}
    </View>
  );
};
