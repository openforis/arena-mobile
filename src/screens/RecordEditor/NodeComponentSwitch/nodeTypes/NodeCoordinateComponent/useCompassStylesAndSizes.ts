import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";

import { ColorUtils } from "utils";

const assetsPath = "../../../../../../assets";
const compassBgBlack = require(`${assetsPath}/compass_bg_black.png`);
const compassBgWhite = require(`${assetsPath}/compass_bg_white.png`);

export const arrowToTargetVisibleDistanceThreshold = 30;

export const useCompassColors = () => {
  const theme = useTheme();

  const compassBg = theme.dark ? compassBgWhite : compassBgBlack;

  const bearingTriangleColor = useMemo(
    () => ColorUtils.withOpacity(theme.colors.primary, 0.6),
    [theme.colors.primary],
  );

  const centerCrossColor = useMemo(
    () => ColorUtils.withOpacity(theme.colors.onSurface, 0.7),
    [theme.colors.onSurface],
  );

  return { compassBg, bearingTriangleColor, centerCrossColor };
};

type UseCompassStylesAndSizesProps = {
  angleToTarget: number;
  arrowToTargetVisible: boolean;
  bearingTriangleColor: string;
  centerCrossColor: string;
  distance: number;
  heading: number;
  landscapeOrientation: boolean;
  minDimension: number;
};

export const useCompassStylesAndSizes = ({
  angleToTarget,
  arrowToTargetVisible,
  bearingTriangleColor,
  centerCrossColor,
  distance,
  heading,
  landscapeOrientation,
  minDimension,
}: UseCompassStylesAndSizesProps) => {
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

    const targetLocationBoxMargin =
      (compassImageSize -
        targetLocationBoxWidth +
        (targetLocationBoxWidth - targetLocationBoxWidthAdjusted)) /
      2;
    return {
      sizes: {
        compassImageSize,
        arrowToTargetHeight: compassImageSize * 0.7,
        bearingTriangleInset,
        bearingTriangleSize,
        targetLocationBoxWidth,
        targetLocationMarkerHeight,
        targetLocationBoxMargin,
        targetLocationBoxWidthAdjusted,
      },
      dynamicStyles: StyleSheet.create({
        compassWrapper: {
          height: compassImageSize,
          width: compassImageSize,
        },
        compassBackground: {
          position: "absolute",
          top: 0,
          left: 0,
          height: compassImageSize,
          width: compassImageSize,
          resizeMode: "contain",
          transform: [{ rotate: `${360 - heading} deg` }],
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
        targetLocationMarkerWrapper: {
          backgroundColor: "transparent",
          width: targetLocationBoxWidthAdjusted,
          height: targetLocationBoxWidthAdjusted,
          position: "absolute",
          top: targetLocationBoxMargin,
          left: targetLocationBoxMargin,
          transform: [{ rotate: angleToTarget + "deg" }],
        },
        targetLocationMarker: {
          alignSelf: "center",
          height: targetLocationMarkerHeight,
          resizeMode: "contain",
        },
      }),
    };
  }, [
    angleToTarget,
    arrowToTargetVisible,
    bearingTriangleColor,
    centerCrossColor,
    distance,
    heading,
    landscapeOrientation,
    minDimension,
  ]);

  return dynamicStylesAndSizes;
};
