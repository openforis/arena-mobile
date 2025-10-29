import React, { useCallback } from "react";
import RNSlider from "@react-native-community/slider";
import { useTheme } from "react-native-paper";

import { Environment } from "utils/Environment";
import { Dropdown } from "./Dropdown";
import { Numbers } from "@openforis/arena-core";

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
    // to allow selection of discrete values

    // possible values calculation
    // e.g. min=2, max=8, step=2 => possible values: 2,4,6,8 => count=4
    // e.g. min=1 max=5, step=1 => possible values: 1,2,3,4,5 => count=5
    const possibleValuesCount = Math.ceil((maxValue - minValue) / step) + 1;
    const options = [];
    for (let index = 0; index < possibleValuesCount; index++) {
      const numValue = minValue + step * index;
      const value = Number.isInteger(numValue)
        ? String(numValue)
        : Numbers.formatDecimal(numValue, 2);
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
