import { StyleSheet, View } from "react-native";

import { PROXIMITY_THRESHOLD_METRES } from "./locationNavigatorConstants";
import { TargetLocationIcon } from "./TargetLocationIcon";

const toRad = (deg: number) => (deg * Math.PI) / 180;

const ICON_SIZE = 18;
const ICON_HALF = ICON_SIZE / 2;

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
    <View style={[StyleSheet.absoluteFill, { width: size, height: size }]}>
      <View
        style={{
          position: "absolute",
          left: dotX - ICON_HALF,
          top: dotY - ICON_HALF,
        }}
      >
        <TargetLocationIcon size={ICON_SIZE} />
      </View>
    </View>
  );
};
