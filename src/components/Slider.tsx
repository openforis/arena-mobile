import React, { useCallback } from "react";
import RNSlider from "@react-native-community/slider";
import { useTheme } from "react-native-paper";

type Props = {
  maxValue?: number;
  minValue?: number;
  onValueChange?: (value: number) => void;
  step?: number;
  value?: number;
};

export const Slider = (props: Props) => {
  const { maxValue, minValue, onValueChange, step, value } = props;

  const theme = useTheme();

  const onChange = useCallback(
    (val: any) => {
      if (val !== value) {
        onValueChange?.(val);
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
