import React, { useCallback } from "react";
import RNSlider from "@react-native-community/slider";
import { useTheme } from "react-native-paper";

import { Environment } from "utils/Environment";
import { Dropdown } from "./Dropdown";

type Props = {
  maxValue?: number;
  minValue?: number;
  onValueChange?: (value: number) => void;
  step?: number;
  value?: number;
};

export const Slider = (props: Props) => {
  const { maxValue = 1, minValue = 0, onValueChange, step = 1, value } = props;

  const theme = useTheme();

  const onChange = useCallback(
    (val: any) => {
      if (val !== value) {
        onValueChange?.(val);
      }
    },
    [onValueChange, value]
  );

  if (Environment.isAndroid && Environment.androidApiLevel <= 27) {
    // @react-native-community/slider not supported in Android 8:
    // render a Dropdown instead of the slider
    const possibleValuesCount = (maxValue - minValue) / step;
    const options = [];
    for (let index = 0; index < possibleValuesCount; index++) {
      const value = String(minValue + step * index);
      options.push({ value, label: value });
    }
    return (
      <Dropdown
        items={options}
        onChange={async (val) => onChange(val)}
        value={String(value)}
      />
    );
  }

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
