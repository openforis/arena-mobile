import { ArrayUtils } from "./ArrayUtils";

describe("ArrayUtils.toggleItem", () => {
  it("adds a missing item at the end", () => {
    expect(ArrayUtils.toggleItem(["a"], "b")).toEqual(["a", "b"]);
  });

  it("removes an existing item without mutating the array", () => {
    const array = ["a", "b"];
    expect(ArrayUtils.toggleItem(array, "a")).toEqual(["b"]);
    expect(array).toEqual(["a", "b"]);
  });
});
