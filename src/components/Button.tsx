import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import { MD3TypescaleKey, Button as RNPButton } from "react-native-paper";

import { useEffectiveTheme } from "hooks/useEffectiveTheme";
import { textDirections, useTextDirection, useTranslation } from "localization";
import { BaseStyles } from "utils/BaseStyles";
import { useButtonOnPress } from "./useButtonPress";

const iconPositionByTextDirection = {
  [textDirections.ltr]: "left",
  [textDirections.rtl]: "right",
};

export type ButtonMode =
  | "text"
  | "outlined"
  | "contained"
  | "elevated"
  | "contained-tonal";
type ButtonColor = "primary" | "secondary" | "tertiary";
export type ButtonIconPosition = "left" | "right";

export type ButtonProps = {
  avoidMultiplePress?: boolean;
  children?: React.ReactNode;
  color?: ButtonColor;
  compact?: boolean;
  disabled?: boolean;
  icon?: string | any;
  iconColor?: string;
  iconPosition?: ButtonIconPosition;
  labelVariant?: string;
  loading?: boolean;
  mode?: ButtonMode;
  multiplePressAvoidanceTimeout?: number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textColor?: string;
  textKey?: string;
  textParams?: any;
};

export const Button = (props: ButtonProps) => {
  const {
    avoidMultiplePress = true,
    color = "primary",
    children,
    iconPosition: iconPositionProp = undefined,
    labelVariant = undefined,
    loading,
    mode: modeProp = "contained",
    multiplePressAvoidanceTimeout,
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
  const text = (textKey?.length ?? 0) > 0 ? t(textKey!, textParams) : undefined;

  const contentStyle =
    iconPosition === "left" ? undefined : BaseStyles.flexDirectionRowReverse;
  const labelStyle = labelVariant
    ? theme?.fonts[labelVariant as MD3TypescaleKey]
    : undefined;

  const { actualLoading, onPress } = useButtonOnPress({
    avoidMultiplePress,
    loading,
    multiplePressAvoidanceTimeout,
    onPressProp,
  });

  const mode = color === "secondary" ? "outlined" : modeProp;
  const buttonColor =
    mode !== "text" && color === "primary"
      ? theme?.colors[color as never]
      : undefined;

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
