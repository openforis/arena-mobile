import { getItemKeysSignature } from "./dataTableUtils";

describe("getItemKeysSignature", () => {
  test("same keys in a different order give the same signature", () => {
    expect(getItemKeysSignature([{ key: "b" }, { key: "a" }])).toBe(
      getItemKeysSignature([{ key: "a" }, { key: "b" }]),
    );
  });

  test("new item objects with the same keys give the same signature", () => {
    const items = [{ key: 1 }, { key: 2 }];
    expect(getItemKeysSignature(items.map((item) => ({ ...item })))).toBe(
      getItemKeysSignature(items),
    );
  });

  test("a different set of keys gives a different signature", () => {
    expect(getItemKeysSignature([{ key: "a" }, { key: "b" }])).not.toBe(
      getItemKeysSignature([{ key: "a" }, { key: "c" }]),
    );
    expect(getItemKeysSignature([{ key: "a" }])).not.toBe(
      getItemKeysSignature([{ key: "a" }, { key: "b" }]),
    );
  });

  test("empty list", () => {
    expect(getItemKeysSignature([])).toBe("");
  });
});
