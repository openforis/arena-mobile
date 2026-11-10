import { loadNotRequestedValues } from "./useLazyLoadedByKey";

jest.mock("hooks", () => ({}));

describe("loadNotRequestedValues", () => {
  it("loads only the keys not requested yet, null when not available", async () => {
    const requestedKeys = new Set(["a"]);
    const load = jest.fn(async (key: string) =>
      key === "c" ? undefined : `value-${key}`,
    );

    const valueByKey = await loadNotRequestedValues({
      keys: ["a", "b", "c"],
      requestedKeys,
      load,
    });

    expect(valueByKey).toEqual({ b: "value-b", c: null });
    expect(load).toHaveBeenCalledTimes(2);
    expect([...requestedKeys]).toEqual(["a", "b", "c"]);
  });

  it("loads nothing when all the keys were requested", async () => {
    const load = jest.fn();

    const valueByKey = await loadNotRequestedValues({
      keys: ["a"],
      requestedKeys: new Set(["a"]),
      load,
    });

    expect(valueByKey).toEqual({});
    expect(load).not.toHaveBeenCalled();
  });

  it("forgets the keys of a failed load, so they are requested again", async () => {
    const requestedKeys = new Set<string>();
    const load = jest
      .fn()
      .mockRejectedValueOnce(new Error("read error"))
      .mockResolvedValue("value");

    await expect(
      loadNotRequestedValues({ keys: ["a"], requestedKeys, load }),
    ).rejects.toThrow("read error");
    expect(requestedKeys.size).toBe(0);

    const valueByKey = await loadNotRequestedValues({
      keys: ["a"],
      requestedKeys,
      load,
    });
    expect(valueByKey).toEqual({ a: "value" });
  });
});
