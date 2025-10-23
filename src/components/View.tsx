import React, { useMemo } from "react";
import { StyleSheet, View as RNView } from "react-native";
import { useTheme } from "react-native-paper";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

const styles = StyleSheet.create({
  fullWidth: {
    width: "100%",
  },
  fullFlex: {
    flex: 1,
  },
});

export const View = (props: any) => {
  const {
    children,
    fullFlex = false,
    fullWidth = false,
    style: styleProp,
    transparent = false,
    ...otherProps
  } = props;

  const theme = useTheme();

  const backgroundColor = useMemo(
    () => (transparent ? "transparent" : theme.colors.background),
    [theme, transparent]
  );

  const style = useMemo(() => {
    const parts = [{ backgroundColor }];
    // @ts-expect-error TS(2345): Argument of type '{ flex: number; }' is not assign... Remove this comment to see the full error message
    if (fullFlex) parts.push(styles.fullFlex);
    // @ts-expect-error TS(2345): Argument of type '{ width: "100%"; }' is not assig... Remove this comment to see the full error message
    if (fullWidth) parts.push(styles.fullWidth);
    if (styleProp) parts.push(styleProp);
    // @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
    return StyleSheet.compose(parts);
  }, [backgroundColor, fullFlex, fullWidth, styleProp]);

  return (
    <RNView  style={style} {...otherProps}>
      {children}
    </RNView>
  );
};

View.propTypes = {
  children: PropTypes.node,
  fullFlex: PropTypes.bool,
  fullWidth: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  transparent: PropTypes.bool,
};
