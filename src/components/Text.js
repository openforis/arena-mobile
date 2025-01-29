import { useMemo } from "react";
import { Text as RNText } from "react-native-paper";
import PropTypes from "prop-types";

import { useIsTextDirectionRtl, useTranslation } from "localization";

const styleToObject = (style) =>
  Array.isArray(style)
    ? Object.assign({}, ...style.map(styleToObject))
    : (style ?? {});

export const Text = (props) => {
  const {
    children,
    numberOfLines,
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
    return !textAlign ? [_style, { textAlign: "right" }] : _style;
  }, [isRtl, styleProp]);

  return (
    <RNText
      numberOfLines={numberOfLines}
      selectable={selectable}
      style={style}
      variant={variant}
    >
      {textKey ? t(textKey, textParams) : null}
      {children}
    </RNText>
  );
};

Text.propTypes = {
  children: PropTypes.node,
  numberOfLines: PropTypes.number,
  selectable: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  textKey: PropTypes.string,
  textParams: PropTypes.object,
  variant: PropTypes.oneOf([
    "displayLarge",
    "displayMedium",
    "displaySmall",
    "headlineLarge",
    "headlineMedium",
    "headlineSmall",
    "titleLarge",
    "titleMedium",
    "titleSmall",
    "labelLarge",
    "labelMedium",
    "labelSmall",
    "bodyLarge",
    "bodyMedium",
    "bodySmall",
  ]),
};
