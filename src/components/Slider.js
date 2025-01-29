import React from "react";
import { Slider as RNSlider } from "@miblanchard/react-native-slider";
import { useTheme } from "react-native-paper";
import PropTypes from "prop-types";

export const Slider = (props) => {
  const { maxValue, minValue, onValueChange, step, value } = props;

  const theme = useTheme();

  return (
    <RNSlider
      minimumTrackTintColor={theme.colors.primary}
      maximumTrackTintColor={theme.colors.inversePrimary}
      thumbTintColor={theme.colors.primary}
      maximumValue={maxValue}
      minimumValue={minValue}
      onValueChange={onValueChange}
      step={step}
      value={value}
    />
  );
};

Slider.propTypes = {
  maxValue: PropTypes.number,
  minValue: PropTypes.number,
  onValueChange: PropTypes.func,
  step: PropTypes.number,
  value: PropTypes.number,
};
