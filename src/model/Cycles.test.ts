import { Cycles } from "./Cycles";

const surveyWithCycles = (cycleKeys: string[]) =>
  ({
    props: {
      cycles: Object.fromEntries(cycleKeys.map((key) => [key, {}])),
    },
  }) as any;

describe("Cycles", () => {
  test("getPrevCycleKey", () => {
    expect(Cycles.getPrevCycleKey("2")).toBe("1");
    expect(Cycles.getPrevCycleKey("1")).toBe("0");
    // first cycle has no previous one: returned as is
    expect(Cycles.getPrevCycleKey("0")).toBe("0");
  });

  test("getPrevCycleKeys", () => {
    const survey = surveyWithCycles(["0", "1", "2"]);
    expect(Cycles.getPrevCycleKeys({ survey, cycleKey: "2" })).toEqual([
      "0",
      "1",
    ]);
    expect(Cycles.getPrevCycleKeys({ survey, cycleKey: "0" })).toEqual([]);
    expect(
      Cycles.getPrevCycleKeys({ survey: { props: {} }, cycleKey: "0" }),
    ).toEqual([]);
  });

  test("getPrevCycleKeys with unknown cycle key drops only the last cycle", () => {
    // indexOf returns -1, so slice(0, -1) is returned
    const survey = surveyWithCycles(["0", "1", "2"]);
    expect(Cycles.getPrevCycleKeys({ survey, cycleKey: "9" })).toEqual([
      "0",
      "1",
    ]);
  });

  test("isPreviousCycle", () => {
    expect(
      Cycles.isPreviousCycle({ defaultCycleKey: "2", cycleKey: "1" }),
    ).toBe(true);
    expect(
      Cycles.isPreviousCycle({ defaultCycleKey: "2", cycleKey: "0" }),
    ).toBe(false);
    expect(
      Cycles.isPreviousCycle({ defaultCycleKey: "1", cycleKey: "1" }),
    ).toBe(false);
  });

  test("isPreviousCycle is true for the first cycle compared with itself", () => {
    // getPrevCycleKey("0") returns "0"
    expect(
      Cycles.isPreviousCycle({ defaultCycleKey: "0", cycleKey: "0" }),
    ).toBe(true);
  });

  test("labelFunction is 1-based", () => {
    expect(Cycles.labelFunction("0")).toBe("1");
    expect(Cycles.labelFunction("9")).toBe("10");
  });
});
