import { canSaveMapName } from "./mapNameUtils";

describe("canSaveMapName", () => {
  it("allows saving a valid changed name", () => {
    expect(
      canSaveMapName({ name: "New", savedName: "Old", nameErrorKey: null }),
    ).toBe(true);
  });

  it("does not allow saving when the map is not available", () => {
    expect(
      canSaveMapName({ name: "New", savedName: undefined, nameErrorKey: null }),
    ).toBe(false);
  });

  it("does not allow saving an invalid name", () => {
    expect(
      canSaveMapName({
        name: "",
        savedName: "Old",
        nameErrorKey: "error.key",
      }),
    ).toBe(false);
  });

  it("does not allow saving an unchanged name (ignoring surrounding spaces)", () => {
    expect(
      canSaveMapName({ name: " Old ", savedName: "Old", nameErrorKey: null }),
    ).toBe(false);
  });
});
