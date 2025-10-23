import React from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";
import { Button as RNPButton } from "react-native-paper";

// @ts-expect-error TS(2307): Cannot find module 'hooks/useEffectiveTheme' or it... Remove this comment to see the full error message
import { useEffectiveTheme } from "hooks/useEffectiveTheme";
// @ts-expect-error TS(2307): Cannot find module 'localization' or its correspon... Remove this comment to see the full error message
import { textDirections, useTextDirection, useTranslation } from "localization";
// @ts-expect-error TS(2307): Cannot find module 'utils/BaseStyles' or its corre... Remove this comment to see the full error message
import { BaseStyles } from "utils/BaseStyles";
import { useButtonOnPress } from "./useButtonPress";

const iconPositionByTextDirection = {
  [textDirections.ltr]: "left",
  [textDirections.rtl]: "right",
};

export const Button = (props: any) => {
  const {
    avoidMultiplePress = true,
    color = "primary",
    children,
    iconPosition: iconPositionProp = undefined,
    labelVariant = undefined,
    loading,
    mode: modeProp = "contained",
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

  const mode = color === "secondary" ? "outlined" : modeProp;
  const buttonColor =
    mode !== "text" && color === "primary" ? theme.colors[color] : undefined;

  return (
    <RNPButton
      buttonColor={buttonColor}
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
  color: PropTypes.oneOf(["primary", "secondary", "tertiary"]),
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
