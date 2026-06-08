import { StyleSheet, View } from "react-native";
import { Circle, Line, Svg } from "react-native-svg";

const toRad = (deg: number) => (deg * Math.PI) / 180;

const PROXIMITY_THRESHOLD = 30; // metres — must match useLocationNavigator

type ProximityDotProps = {
  size: number;
  angle: number;
  distance: number;
  accuracy: number | null;
};

export const ProximityDot = ({
  size,
  angle,
  distance,
  accuracy,
}: ProximityDotProps) => {
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 4;
  const maxDotRadius = R * 0.85;

  // Dot moves from near the edge toward the center as distance approaches 0
  const distRatio = Math.min(1, Math.max(0, distance / PROXIMITY_THRESHOLD));
  const dotRadius = maxDotRadius * distRatio;
  const rad = toRad(angle);
  const dotX = cx + dotRadius * Math.sin(rad);
  const dotY = cy - dotRadius * Math.cos(rad);

  // Accuracy circle: radius in pixels scales linearly with GPS accuracy
  const accuracyRpx =
    accuracy != null
      ? Math.min(R, Math.max(6, (R * accuracy) / PROXIMITY_THRESHOLD))
      : null;

  const crossHalf = R * 0.07;

  return (
    <View style={[StyleSheet.absoluteFillObject, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Accuracy circle (GPS uncertainty) */}
        {accuracyRpx != null && (
          <Circle
            cx={cx}
            cy={cy}
            r={accuracyRpx}
            fill="rgba(100,180,255,0.12)"
            stroke="rgba(100,180,255,0.45)"
            strokeWidth={1.5}
          />
        )}
        {/* Center cross — you are here */}
        <Line
          x1={cx - crossHalf}
          y1={cy}
          x2={cx + crossHalf}
          y2={cy}
          stroke="#4caf50"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <Line
          x1={cx}
          y1={cy - crossHalf}
          x2={cx}
          y2={cy + crossHalf}
          stroke="#4caf50"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        {/* Target dot — absolute bearing, moves toward center as you close in */}
        <Circle cx={dotX} cy={dotY} r={9} fill="#4caf50" />
      </Svg>
    </View>
  );
};
