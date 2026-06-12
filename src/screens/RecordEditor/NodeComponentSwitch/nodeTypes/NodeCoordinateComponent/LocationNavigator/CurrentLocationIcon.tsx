import { View } from "react-native";
import { Circle, Line, Svg } from "react-native-svg";
import { useTheme } from "react-native-paper";

type CurrentLocationIconProps = {
  size?: number;
};

export const CurrentLocationIcon = ({
  size = 20,
}: CurrentLocationIconProps) => {
  const theme = useTheme();
  const primaryColor = theme.colors.primary;
  const cx = size / 2;
  const cy = size / 2;
  const halfSize = size * 0.38;
  const strokeWidth = size * 0.1;
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Line
          x1={cx - halfSize}
          y1={cy}
          x2={cx + halfSize}
          y2={cy}
          stroke={primaryColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <Line
          x1={cx}
          y1={cy - halfSize}
          x2={cx}
          y2={cy + halfSize}
          stroke={primaryColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <Circle cx={cx} cy={cy} r={size * 0.18} fill={primaryColor} />
      </Svg>
    </View>
  );
};
