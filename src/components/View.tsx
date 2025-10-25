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

type Props = {
  children?: React.ReactNode;
  fullFlex?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  transparent?: boolean;
};

export const View = (props: Props) => {
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
    const parts: any[] = [{ backgroundColor }];
    if (fullFlex) parts.push(styles.fullFlex);
    if (fullWidth) parts.push(styles.fullWidth);
    if (styleProp) parts.push(styleProp);
    return parts;
  }, [backgroundColor, fullFlex, fullWidth, styleProp]);

  return (
    <RNView style={style} {...otherProps}>
      {children}
    </RNView>
  );
};
