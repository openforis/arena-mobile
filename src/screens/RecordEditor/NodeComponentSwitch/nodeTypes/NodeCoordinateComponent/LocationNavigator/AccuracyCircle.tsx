import { StyleSheet, View } from "react-native";
import { Circle, Svg } from "react-native-svg";

import { PROXIMITY_THRESHOLD_METRES } from "./locationNavigatorConstants";

type AccuracyCircleProps = {
  size: number;
  accuracy: number | null;
};

const fillColor = "rgba(100,180,255,0.12)";
const strokeColor = "rgba(100,180,255,0.45)";
const strokeWidth = 1.5;

export const AccuracyCircle = ({ size, accuracy }: AccuracyCircleProps) => {
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 4;

  const accuracyRpx =
    accuracy == null
      ? null
      : Math.min(R, Math.max(6, (R * accuracy) / PROXIMITY_THRESHOLD_METRES));

  if (accuracyRpx == null) return null;

  return (
    <View
      style={[StyleSheet.absoluteFillObject, { width: size, height: size }]}
    >
      <Svg width={size} height={size}>
        <Circle
          cx={cx}
          cy={cy}
          r={accuracyRpx}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      </Svg>
    </View>
  );
};
