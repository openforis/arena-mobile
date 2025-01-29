import React from "react";
import PropTypes from "prop-types";
import { Button as RNPButton } from "react-native-paper";

import { useEffectiveTheme } from "hooks/useEffectiveTheme";
import { textDirections, useTextDirection, useTranslation } from "localization";
import { BaseStyles } from "utils/BaseStyles";
import { useButtonOnPress } from "./useButtonPress";

const iconPositionByTextDirection = {
  [textDirections.ltr]: "left",
  [textDirections.rtl]: "right",
};

export const Button = (props) => {
  const {
    avoidMultiplePress = true,
    children,
    iconPosition: iconPositionProp = undefined,
    labelVariant = undefined,
    loading,
    mode = "contained",
    onPress: onPressProp,
    textKey,
    textParams,
    ...otherProps
  } = props;

  const theme = useEffectiveTheme();
  const { t } = useTranslation();
  const textDirection = useTextDirection();
  const iconPosition =
    iconPositionProp ?? iconPositionByTextDirection[textDirection];
  const text = textKey?.length > 0 ? t(textKey, textParams) : undefined;

  const contentStyle =
    iconPosition === "left" ? undefined : BaseStyles.flexDirectionRowReverse;
  const labelStyle = labelVariant ? theme.fonts[labelVariant] : undefined;

  const { actualLoading, onPress } = useButtonOnPress({
    avoidMultiplePress,
    loading,
    onPressProp,
  });

  return (
    <RNPButton
      contentStyle={contentStyle}
      labelStyle={labelStyle}
      loading={actualLoading}
      mode={mode}
      onPress={onPress}
      {...otherProps}
    >
      {text}
      {children}
    </RNPButton>
  );
};

Button.propTypes = {
  avoidMultiplePress: PropTypes.bool,
  children: PropTypes.node,
  iconPosition: PropTypes.oneOf(["left", "right"]),
  labelVariant: PropTypes.string,
  loading: PropTypes.bool,
  mode: PropTypes.oneOf([
    "text",
    "outlined",
    "contained",
    "elevated",
    "contained-tonal",
  ]),
  onPress: PropTypes.func,
  textKey: PropTypes.string,
  textParams: PropTypes.object,
};
