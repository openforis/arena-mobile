import { StyleSheet, View } from "react-native";
import { Line, Svg } from "react-native-svg";

type CenterCrossProps = {
  size: number;
};

const strokeColor = "#4caf50";
const strokeWidth = 2.5;

export const CenterCross = ({ size }: CenterCrossProps) => {
  const cx = size / 2;
  const cy = size / 2;
  const crossHalf = (size / 2 - 4) * 0.07;

  return (
    <View
      style={[StyleSheet.absoluteFillObject, { width: size, height: size }]}
    >
      <Svg width={size} height={size}>
        <Line
          x1={cx - crossHalf}
          y1={cy}
          x2={cx + crossHalf}
          y2={cy}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <Line
          x1={cx}
          y1={cy - crossHalf}
          x2={cx}
          y2={cy + crossHalf}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
};
