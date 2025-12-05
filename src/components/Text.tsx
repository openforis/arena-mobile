import { useMemo } from "react";
import { Text as RNText } from "react-native-paper";
import { StyleProp, TextStyle } from "react-native";

import { useIsTextDirectionRtl, useTranslation } from "localization";

const styleToObject = (style: any): any =>
  Array.isArray(style)
    ? Object.assign({}, ...style.map(styleToObject))
    : (style ?? {});

type TextVariant =
  | "displayLarge"
  | "displayMedium"
  | "displaySmall"
  | "headlineLarge"
  | "headlineMedium"
  | "headlineSmall"
  | "titleLarge"
  | "titleMedium"
  | "titleSmall"
  | "labelLarge"
  | "labelMedium"
  | "labelSmall"
  | "bodyLarge"
  | "bodyMedium"
  | "bodySmall";

type Props = {
  children?: React.ReactNode;
  numberOfLines?: number;
  onPress?: () => void;
  selectable?: boolean;
  style?: StyleProp<TextStyle>;
  textKey?: string;
  textParams?: any;
  variant?: TextVariant;
};

export const Text = (props: Props) => {
  const {
    children,
    numberOfLines,
    onPress,
    selectable,
    style: styleProp,
    textKey,
    textParams,
    variant,
  } = props;

  const isRtl = useIsTextDirectionRtl();
  const { t } = useTranslation();

  const style = useMemo(() => {
    if (!isRtl) {
      return styleProp;
    }
    const _style = styleToObject(styleProp);
    const { textAlign } = _style;
    return textAlign ? _style : [_style, { textAlign: "right" }];
  }, [isRtl, styleProp]);

  return (
    <RNText
      numberOfLines={numberOfLines}
      onPress={onPress}
      selectable={selectable}
      style={style}
      variant={variant}
    >
      {textKey ? t(textKey, textParams) : null}
      {children}
    </RNText>
  );
};
