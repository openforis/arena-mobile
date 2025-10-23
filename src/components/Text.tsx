import { useMemo } from "react";
import { Text as RNText } from "react-native-paper";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import { useIsTextDirectionRtl, useTranslation } from "localization";

// @ts-expect-error TS(7023): 'styleToObject' implicitly has return type 'any' b... Remove this comment to see the full error message
const styleToObject = (style: any) => Array.isArray(style)
  ? Object.assign({}, ...style.map(styleToObject))
  : (style ?? {});

export const Text = (props: any) => {
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
