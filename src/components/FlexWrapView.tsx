import React, { useMemo } from "react";
import { StyleProp, ViewStyle } from "react-native";

import { useIsTextDirectionRtl } from "localization";
import { BaseStyles } from "utils";

import { View } from "./View";

const baseStyle = {
  display: "flex" as const,
  flexDirection: "row" as const,
  flexWrap: "wrap" as const,
  alignItems: "center" as const,
  columnGap: 10 as const,
};

type Props = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const FlexWrapView = (props: Props) => {
  const { children, style: styleProp, ...otherProps } = props;

  const isRtl = useIsTextDirectionRtl();

  const style: StyleProp<ViewStyle> = useMemo(() => {
    const _style: StyleProp<ViewStyle> = [baseStyle];
    if (isRtl) {
      _style.push(BaseStyles.flexDirectionRowReverse as any);
    }
    if (styleProp) {
      _style.push(styleProp);
    }
    return _style;
  }, [isRtl, styleProp]);

  return (
    <View style={style} {...otherProps}>
      {children}
    </View>
  );
};
