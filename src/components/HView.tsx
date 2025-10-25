import { useMemo } from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";

import { useIsTextDirectionRtl } from "localization";

import { View } from "./View";

const defaultStyle = StyleSheet.create({
  base: { display: "flex", flexDirection: "row", gap: 4 },
});

const rtlStyle = { flexDirection: "row-reverse" };

type Props = {
  children?: React.ReactNode;
  fullFlex?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textDirectionAware?: boolean;
  transparent?: boolean;
};

export const HView = (props: Props) => {
  const {
    children,
    fullWidth = false,
    style: styleProp,
    textDirectionAware = true,
    ...otherProps
  } = props;

  const isRtl = useIsTextDirectionRtl();

  const style = useMemo(
    () => [
      defaultStyle.base,
      textDirectionAware && isRtl ? rtlStyle : undefined,
      styleProp,
    ],
    [isRtl, styleProp, textDirectionAware]
  );

  return (
    <View fullWidth={fullWidth} style={style} {...otherProps}>
      {children}
    </View>
  );
};
