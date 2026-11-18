import { DbUtils } from "./dbUtils";

describe("DbUtils.placeholders", () => {
  test("one placeholder per value", () => {
    expect(DbUtils.placeholders(["a", 1, "b"])).toBe("?, ?, ?");
  });

  test("empty list", () => {
    expect(DbUtils.placeholders([])).toBe("");
  });
});
