import { StyleSheet, ViewStyle } from "react-native";
import Animated, { type AnimatedStyle } from "react-native-reanimated";
import { Circle, Polygon, Rect, Svg } from "react-native-svg";

import { ColorUtils } from "utils";

type NavigatorArrowProps = {
  arrowRotStyle: AnimatedStyle<ViewStyle>;
  arrowColor: string;
  size: number;
};

const ARROW = {
  tipY: 0.68,
  shoulderY: 0.32,
  headHalfW: 0.08,
  stemHalfW: 0.04,
  tailY: 0.28,
  tailHalfW: 0.055,
  tailTopY: 0.08,
  shaftGap: 0.05,
  centerDotR: 0.05,
} as const;

const OPACITY = {
  arrowShaft: 0.75,
  tailFin: 0.45,
} as const;

export const NavigatorArrow = ({
  arrowRotStyle,
  arrowColor,
  size,
}: NavigatorArrowProps) => {
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 4;

  const arrowTipY = cy - R * ARROW.tipY;
  const arrowShoulderY = cy - R * ARROW.shoulderY;
  const arrowHeadHalfW = R * ARROW.headHalfW;
  const stemHalfW = R * ARROW.stemHalfW;
  const tailY = cy + R * ARROW.tailY;
  const tailHalfW = R * ARROW.tailHalfW;

  const arrowHeadPoints = `${cx},${arrowTipY} ${cx - arrowHeadHalfW},${arrowShoulderY} ${cx + arrowHeadHalfW},${arrowShoulderY}`;
  const tailPoints = `${cx},${tailY} ${cx - tailHalfW},${cy + R * ARROW.tailTopY} ${cx + tailHalfW},${cy + R * ARROW.tailTopY}`;

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFillObject,
        { width: size, height: size },
        arrowRotStyle,
      ]}
    >
      <Svg width={size} height={size}>
        <Polygon points={arrowHeadPoints} fill={arrowColor} />
        <Rect
          x={cx - stemHalfW}
          y={arrowShoulderY}
          width={stemHalfW * 2}
          height={tailY - arrowShoulderY - R * ARROW.shaftGap}
          fill={arrowColor}
          opacity={OPACITY.arrowShaft}
        />
        <Polygon
          points={tailPoints}
          fill={ColorUtils.withOpacity(arrowColor, OPACITY.tailFin)}
        />
        <Circle cx={cx} cy={cy} r={R * ARROW.centerDotR} fill={arrowColor} />
      </Svg>
    </Animated.View>
  );
};
