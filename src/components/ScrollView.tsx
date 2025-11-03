import { forwardRef, Ref } from "react";
import { ScrollView as RNScrollView, StyleProp, ViewStyle } from "react-native";
import { useTheme } from "react-native-paper";

type Props = {
  children?: React.ReactNode;
  horizontal?: boolean;
  persistentScrollbar?: boolean;
  showsVerticalScrollIndicator?: boolean;
  style?: StyleProp<ViewStyle>;
  transparent?: boolean;
};

export const ScrollView = forwardRef(function ScrollView(
  props: Props,
  ref: Ref<RNScrollView>
) {
  const {
    children,
    persistentScrollbar,
    style: styleProp,
    transparent,
    ...otherProps
  } = props;

  const theme = useTheme();

  const style = [
    { backgroundColor: transparent ? "transparent" : theme.colors.background },
    styleProp,
  ];

  return (
    <RNScrollView
      automaticallyAdjustKeyboardInsets
      persistentScrollbar={persistentScrollbar}
      ref={ref}
      style={style}
      {...otherProps}
    >
      {children}
    </RNScrollView>
  );
});
