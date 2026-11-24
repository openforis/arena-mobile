import { Numbers } from "@openforis/arena-core";

export type SliderDropdownOption = { value: number; label: string };

// rounding removes floating point noise (e.g. 0.1 * 3 = 0.30000000000000004)
export const roundSliderValue = (value: number): number =>
  Numbers.roundToPrecision(value, 6);

// possible values, e.g. min=2, max=8, step=2 => 2,4,6,8
export const getSliderDropdownOptions = ({
  minValue,
  maxValue,
  step,
}: {
  minValue: number;
  maxValue: number;
  step: number;
}): SliderDropdownOption[] => {
  const count = Math.ceil((maxValue - minValue) / step) + 1;
  const options: SliderDropdownOption[] = [];
  for (let index = 0; index < count; index++) {
    const value = roundSliderValue(minValue + step * index);
    const label = Number.isInteger(value)
      ? String(value)
      : (Numbers.formatDecimal(value, 2) ?? String(value));
    options.push({ value, label });
  }
  return options;
};
