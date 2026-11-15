import { RecordSummaries } from "./RecordSummaries";

describe("RecordSummaries.hasErrors", () => {
  test("true when the validation counts have errors", () => {
    expect(
      RecordSummaries.hasErrors({
        validation: { valid: false, counts: { errors: 2, warnings: 0 } },
      }),
    ).toBe(true);
  });

  test("false with only warnings", () => {
    expect(
      RecordSummaries.hasErrors({
        validation: { valid: false, counts: { errors: 0, warnings: 3 } },
      }),
    ).toBe(false);
  });

  test("false without validation", () => {
    expect(RecordSummaries.hasErrors({ validation: null })).toBe(false);
    expect(RecordSummaries.hasErrors({})).toBe(false);
  });
});
