import React from "react";
import { StyleProp, TextStyle, ViewStyle } from "react-native";
import { MD3TypescaleKey, Button as RNPButton } from "react-native-paper";

import { Objects } from "@openforis/arena-core";

import { useEffectiveTheme } from "hooks/useEffectiveTheme";
import { TextDirection, useTextDirection, useTranslation } from "localization";
import { BaseStyles } from "utils/BaseStyles";
import { useButtonOnPress } from "./useButtonPress";

const determineText = ({
  textIsI18nKey,
  textKey,
  textParams,
  t,
}: {
  textIsI18nKey: boolean;
  textKey: string | undefined;
  textParams: any;
  t: (key?: string | null, params?: any) => string;
}) => {
  if (Objects.isEmpty(textKey)) {
    return null;
  }
  if (textIsI18nKey) {
    return t(textKey, textParams);
  }
  return String(textKey);
};

const iconPositionByTextDirection = {
  [TextDirection.ltr]: "left",
  [TextDirection.rtl]: "right",
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
  icon?: any;
  iconColor?: string;
  iconPosition?: ButtonIconPosition;
  labelStyle?: StyleProp<TextStyle>;
  labelVariant?: string;
  loading?: boolean;
  mode?: ButtonMode;
  multiplePressAvoidanceTimeout?: number;
  onPress?: (event: any) => Promise<void> | void;
  style?: StyleProp<ViewStyle>;
  textColor?: string;
  textIsI18nKey?: boolean;
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
    textIsI18nKey = true,
    ...otherProps
  } = props;

  const theme = useEffectiveTheme();
  const { t } = useTranslation();
  const textDirection = useTextDirection();
  const iconPosition =
    iconPositionProp ?? iconPositionByTextDirection[textDirection];
  const text = determineText({ textIsI18nKey, textKey, textParams, t });

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
