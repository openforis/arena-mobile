import { circularEma, nextDisplayedHeading } from "./headingUtils";

describe("headingUtils", () => {
  describe("circularEma", () => {
    test("moves towards the next value", () => {
      expect(circularEma(10, 20, 0.5)).toBeCloseTo(15);
    });

    test("handles the 0/360 wrap-around", () => {
      expect(circularEma(350, 20, 0.5)).toBeCloseTo(5);
      expect(circularEma(20, 350, 0.5)).toBeCloseTo(5);
    });
  });

  describe("nextDisplayedHeading", () => {
    test("first value is rounded to whole degrees", () => {
      expect(nextDisplayedHeading(null, 12.4)).toBe(12);
      expect(nextDisplayedHeading(null, 12.6)).toBe(13);
      expect(nextDisplayedHeading(null, 359.7)).toBe(0);
    });

    test("changes smaller than 1 degree are skipped", () => {
      expect(nextDisplayedHeading(12, 12.9)).toBeNull();
      expect(nextDisplayedHeading(12, 11.2)).toBeNull();
    });

    test("changes of at least 1 degree are emitted", () => {
      expect(nextDisplayedHeading(12, 13.1)).toBe(13);
      expect(nextDisplayedHeading(12, 10.6)).toBe(11);
    });

    test("handles the 0/360 wrap-around", () => {
      expect(nextDisplayedHeading(0, 359.5)).toBeNull();
      expect(nextDisplayedHeading(0, 0.9)).toBeNull();
      expect(nextDisplayedHeading(359, 0.2)).toBe(0);
      expect(nextDisplayedHeading(359, 0.6)).toBe(1);
      expect(nextDisplayedHeading(1, 359.6)).toBe(0);
    });
  });
});
