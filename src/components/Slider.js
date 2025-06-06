import React, { useCallback } from "react";
import RNSlider from "@react-native-community/slider";
import { useTheme } from "react-native-paper";
import PropTypes from "prop-types";

export const Slider = (props) => {
  const { maxValue, minValue, onValueChange, step, value } = props;

  const theme = useTheme();

  const onChange = useCallback(
    (val) => {
      if (val !== value) {
        onValueChange(val);
      }
    },
    [onValueChange, value]
  );

  return (
    <RNSlider
      minimumTrackTintColor={theme.colors.primary}
      maximumTrackTintColor={theme.colors.inversePrimary}
      thumbTintColor={theme.colors.primary}
      maximumValue={maxValue}
      minimumValue={minValue}
      onSlidingComplete={onChange}
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
