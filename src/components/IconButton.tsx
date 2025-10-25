import React from "react";
import { IconButton as RNPIconButton } from "react-native-paper";

import { useButtonOnPress } from "./useButtonPress";
import { ButtonProps } from "./Button";

type IconButtonMode = "outlined" | "contained" | "contained-tonal";

export type IconButtonProps = ButtonProps & {
  mode?: IconButtonMode;
  selected?: boolean;
  size?: number;
};

export const IconButton = (props: IconButtonProps) => {
  const {
    avoidMultiplePress = true,
    disabled,
    icon,
    iconColor,
    loading = false,
    mode = "contained-tonal",
    multiplePressAvoidanceTimeout = 500,
    onPress: onPressProp,
    size = 20,
    ...otherProps
  } = props;

  const { actualLoading, onPress } = useButtonOnPress({
    avoidMultiplePress,
    loading,
    multiplePressAvoidanceTimeout,
    onPressProp,
  });

  return (
    <RNPIconButton
      disabled={disabled}
      icon={icon}
      iconColor={iconColor}
      loading={actualLoading}
      mode={mode}
      onPress={onPress}
      size={size}
      {...otherProps}
    />
  );
};
