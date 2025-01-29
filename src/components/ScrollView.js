import { forwardRef } from "react";
import { ScrollView as RNScrollView } from "react-native";
import { useTheme } from "react-native-paper";
import PropTypes from "prop-types";

export const ScrollView = forwardRef(function ScrollView(props, ref) {
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

ScrollView.propTypes = {
  children: PropTypes.node,
  persistentScrollbar: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  transparent: PropTypes.bool,
};
