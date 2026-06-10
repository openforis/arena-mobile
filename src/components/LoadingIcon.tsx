import { StyleProp, ViewStyle } from "react-native";
import { ActivityIndicator } from "react-native-paper";

type LoadingIconProps = {
  size?: "small" | "large" | number;
  style?: StyleProp<ViewStyle>;
};

export const LoadingIcon = (props: LoadingIconProps) => {
  const { size = "small", style } = props;
  return <ActivityIndicator animating size={size} style={style} />;
};
