import React, { useMemo } from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";

import { View } from "./View";

const baseStyle = StyleSheet.create({
  base: { display: "flex", flexDirection: "column" },
});

type Props = {
  children?: React.ReactNode;
  fullFlex?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  transparent?: boolean;
};

export const VView = (props: Props) => {
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
