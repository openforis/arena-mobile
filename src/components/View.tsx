import React, { useMemo } from "react";
import { StyleSheet, View as RNView, StyleProp, ViewStyle } from "react-native";
import { useTheme } from "react-native-paper";

const styles = StyleSheet.create({
  fullWidth: {
    width: "100%",
  },
  fullFlex: {
    flex: 1,
  },
});

export type ViewProps = {
  children?: React.ReactNode;
  fullFlex?: boolean;
  fullWidth?: boolean;
  pointerEvents?: "box-none" | "none" | "box-only" | "auto";
  style?: StyleProp<ViewStyle>;
  opaque?: boolean;
  testID?: string;
};

export const View = (props: ViewProps) => {
  const {
    children,
    fullFlex = false,
    fullWidth = false,
    pointerEvents = undefined,
    style: styleProp,
    opaque = false,
    testID = undefined,
  } = props;

  const theme = useTheme();

  const backgroundColor = useMemo(
    () => (opaque ? theme.colors.background : "transparent"),
    [theme, opaque],
  );

  const style = useMemo(() => {
    const parts: any[] = [{ backgroundColor }];
    if (fullFlex) parts.push(styles.fullFlex);
    if (fullWidth) parts.push(styles.fullWidth);
    if (styleProp) parts.push(styleProp);
    return parts;
  }, [backgroundColor, fullFlex, fullWidth, styleProp]);

  return (
    <RNView style={style} testID={testID} pointerEvents={pointerEvents}>
      {children}
    </RNView>
  );
};
