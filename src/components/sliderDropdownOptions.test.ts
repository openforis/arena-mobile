import { getSliderDropdownOptions } from "./sliderDropdownOptions";

describe("getSliderDropdownOptions", () => {
  test("integer steps", () => {
    expect(
      getSliderDropdownOptions({ minValue: 2, maxValue: 8, step: 2 }),
    ).toEqual([
      { value: 2, label: "2" },
      { value: 4, label: "4" },
      { value: 6, label: "6" },
      { value: 8, label: "8" },
    ]);
  });

  test("decimal steps have numeric values without floating point noise", () => {
    const options = getSliderDropdownOptions({
      minValue: 0,
      maxValue: 0.3,
      step: 0.1,
    });
    expect(options.map((option) => option.value)).toEqual([0, 0.1, 0.2, 0.3]);
    expect(options.every((option) => typeof option.value === "number")).toBe(
      true,
    );
  });
});
