import { StyleSheet, ViewStyle } from "react-native";
import Animated, { type AnimatedStyle } from "react-native-reanimated";
import { Circle, Svg } from "react-native-svg";

const toRad = (deg: number) => (deg * Math.PI) / 180;

type ProximityDotProps = {
  size: number;
  angle: number;
  compassRotStyle: AnimatedStyle<ViewStyle>;
};

export const ProximityDot = ({
  size,
  angle,
  compassRotStyle,
}: ProximityDotProps) => {
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 4;

  const dotR = R - 10;
  const rad = toRad(angle);
  const dotX = cx + dotR * Math.sin(rad);
  const dotY = cy - dotR * Math.cos(rad);

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFillObject,
        { width: size, height: size },
        compassRotStyle,
      ]}
    >
      <Svg width={size} height={size}>
        <Circle cx={dotX} cy={dotY} r={9} fill="#4caf50" />
      </Svg>
    </Animated.View>
  );
};
