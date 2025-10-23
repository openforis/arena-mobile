import React, { useCallback } from "react";
import RNSlider from "@react-native-community/slider";
import { useTheme } from "react-native-paper";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

export const Slider = (props: any) => {
  const { maxValue, minValue, onValueChange, step, value } = props;

  const theme = useTheme();

  const onChange = useCallback(
    (val: any) => {
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
