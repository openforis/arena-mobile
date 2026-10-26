import { StyleProp, ViewStyle } from "react-native";
import { Appbar as RNPAppbar } from "react-native-paper";

type Props = {
  // injected by AppBarHeader
  color?: string;
  onPress: () => void;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export const AppBarBackAction = (props: Props) => {
  const { color, onPress, size, style } = props;
  return (
    <RNPAppbar.BackAction
      color={color}
      onPress={onPress}
      size={size}
      style={style}
    />
  );
};

// the header places its children according to their displayName
AppBarBackAction.displayName = "Appbar.BackAction";
