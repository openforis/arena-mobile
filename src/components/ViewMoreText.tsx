import RNViewMoreText from "react-native-view-more-text";
import type { StyleProp, TextStyle } from "react-native";

type Props = {
  children?: React.ReactNode;
  numberOfLines?: number;
  textStyle?: StyleProp<TextStyle>;
};

export const ViewMoreText = (props: Props) => {
  const { children, numberOfLines = 2, textStyle } = props;
  return (
    <RNViewMoreText numberOfLines={numberOfLines} textStyle={textStyle}>
      {children}
    </RNViewMoreText>
  );
};
