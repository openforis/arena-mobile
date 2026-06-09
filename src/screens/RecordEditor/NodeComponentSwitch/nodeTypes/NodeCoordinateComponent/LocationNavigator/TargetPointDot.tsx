import { StyleSheet, View } from "react-native";
import { Circle, Svg } from "react-native-svg";

import { PROXIMITY_THRESHOLD_METRES } from "./locationNavigatorConstants";

const toRad = (deg: number) => (deg * Math.PI) / 180;

type TargetPointDotProps = {
  size: number;
  angle: number;
  distance: number;
};

export const TargetPointDot = ({
  size,
  angle,
  distance,
}: TargetPointDotProps) => {
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 4;
  const maxDotRadius = R * 0.85;

  const distRatio = Math.min(1, Math.max(0, distance / PROXIMITY_THRESHOLD_METRES));
  const dotRadius = maxDotRadius * distRatio;
  const rad = toRad(angle);
  const dotX = cx + dotRadius * Math.sin(rad);
  const dotY = cy - dotRadius * Math.cos(rad);

  return (
    <View
      style={[StyleSheet.absoluteFillObject, { width: size, height: size }]}
    >
      <Svg width={size} height={size}>
        <Circle cx={dotX} cy={dotY} r={9} fill="#4caf50" />
      </Svg>
    </View>
  );
};
