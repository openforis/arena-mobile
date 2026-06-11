import { View } from "react-native";
import { Line, Svg } from "react-native-svg";

export const TARGET_COLOR = "#e53935";

type TargetLocationIconProps = {
  size?: number;
};

export const TargetLocationIcon = ({ size = 20 }: TargetLocationIconProps) => {
  const cx = size / 2;
  const cy = size / 2;
  const half = size * 0.38;
  const strokeWidth = size * 0.22;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Line
          x1={cx - half}
          y1={cy - half}
          x2={cx + half}
          y2={cy + half}
          stroke={TARGET_COLOR}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <Line
          x1={cx + half}
          y1={cy - half}
          x2={cx - half}
          y2={cy + half}
          stroke={TARGET_COLOR}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
};
