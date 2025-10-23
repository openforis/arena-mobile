import { forwardRef } from "react";
import { ScrollView as RNScrollView } from "react-native";
import { useTheme } from "react-native-paper";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

export const ScrollView = forwardRef(function ScrollView(props, ref) {
  const {
    // @ts-expect-error TS(2339): Property 'children' does not exist on type '{}'.
    children,
    // @ts-expect-error TS(2339): Property 'persistentScrollbar' does not exist on t... Remove this comment to see the full error message
    persistentScrollbar,
    // @ts-expect-error TS(2339): Property 'style' does not exist on type '{}'.
    style: styleProp,
    // @ts-expect-error TS(2339): Property 'transparent' does not exist on type '{}'... Remove this comment to see the full error message
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
      // @ts-expect-error TS(2769): No overload matches this call.
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
