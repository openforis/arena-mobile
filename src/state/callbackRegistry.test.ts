import { createCallbackRegistry } from "./callbackRegistry";

describe("createCallbackRegistry", () => {
  it("registers callbacks with a new id every time", () => {
    const registry = createCallbackRegistry<{ fn: () => number }>();
    const callbacks1 = { fn: () => 1 };
    const callbacks2 = { fn: () => 2 };
    const id1 = registry.register(callbacks1);
    const id2 = registry.register(callbacks2);
    expect(id1).not.toEqual(id2);
    expect(registry.get(id1)).toBe(callbacks1);
    expect(registry.get(id2)).toBe(callbacks2);
  });

  it("removes callbacks", () => {
    const registry = createCallbackRegistry<{ fn: () => void }>();
    const id = registry.register({ fn: () => {} });
    registry.remove(id);
    expect(registry.get(id)).toBeUndefined();
  });

  it("ignores missing ids", () => {
    const registry = createCallbackRegistry<{ fn: () => void }>();
    expect(registry.get(undefined)).toBeUndefined();
    expect(registry.get(null)).toBeUndefined();
    expect(() => registry.remove(undefined)).not.toThrow();
  });
});
