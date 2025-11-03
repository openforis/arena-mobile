import RNViewMoreText from "react-native-view-more-text";
import { StyleProp, ViewStyle, TextStyle } from "react-native";

type Props = {
  children?: React.ReactNode;
  numberOfLines?: number;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export const ViewMoreText = (props: Props) => {
  const { children, numberOfLines = 2, style, textStyle } = props;
  return (
    <RNViewMoreText
      numberOfLines={numberOfLines}
      style={style}
      textStyle={textStyle}
    >
      {children}
    </RNViewMoreText>
  );
};
