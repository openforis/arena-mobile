import React, { useMemo } from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";

import { View, ViewProps } from "./View";

const baseStyle = StyleSheet.create({
  base: { display: "flex", flexDirection: "column" },
});

export const VView = (props: ViewProps) => {
  const { children, style: styleProp, ...otherProps } = props;

  const style: StyleProp<ViewStyle> = useMemo(
    () => [baseStyle.base, styleProp],
    [styleProp]
  );

  return (
    <View style={style} {...otherProps}>
      {children}
    </View>
  );
};
