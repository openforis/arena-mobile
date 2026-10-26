import { StyleProp, ViewStyle } from "react-native";
import { Appbar as RNPAppbar } from "react-native-paper";

type Props = {
  onPress: () => void;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export const AppBarBackAction = (props: Props) => {
  const { onPress, size, style } = props;
  return <RNPAppbar.BackAction onPress={onPress} size={size} style={style} />;
};
