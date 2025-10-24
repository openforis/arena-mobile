import React from "react";
import { IconButton as RNPIconButton } from "react-native-paper";
import PropTypes from "prop-types";

import { useButtonOnPress } from "./useButtonPress";

export const IconButton = (props: any) => {
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

IconButton.propTypes = {
  avoidMultiplePress: PropTypes.bool,
  disabled: PropTypes.bool,
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  iconColor: PropTypes.string,
  loading: PropTypes.bool,
  mode: PropTypes.string,
  multiplePressAvoidanceTimeout: PropTypes.number,
  onPress: PropTypes.func,
  size: PropTypes.number,
};
