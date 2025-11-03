import { useMemo } from "react";
import { StyleSheet } from "react-native";

import { useIsTextDirectionRtl } from "localization";

import { View, ViewProps } from "./View";

const styles = StyleSheet.create({
  base: { display: "flex", flexDirection: "row", gap: 4 },
  rtlStyle: { flexDirection: "row-reverse" },
});

type Props = ViewProps & {
  textDirectionAware?: boolean;
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
      styles.base,
      textDirectionAware && isRtl ? styles.rtlStyle : undefined,
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
