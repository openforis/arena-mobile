import { DbUtils } from "./dbUtils";

describe("DbUtils.quoteValues", () => {
  it("builds a list of string literals", () => {
    expect(DbUtils.quoteValues(["a", 1])).toBe("'a','1'");
  });

  it("does not let a value end its literal", () => {
    expect(DbUtils.quoteValues(["x') OR 1=1 --"])).toBe("'x'') OR 1=1 --'");
  });
});
