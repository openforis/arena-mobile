import type { SettingsObject } from "model/SettingsModel";

import { SettingsReducer, SettingsSliceActions } from "./reducer";

describe("SettingsReducer", () => {
  it("starts from an empty state", () => {
    expect(SettingsReducer(undefined, { type: "@@INIT" })).toEqual({});
  });

  it("set merges the settings into the previous ones", () => {
    const prev = { theme: "dark", fontScale: 1 } as unknown as SettingsObject;
    const state = SettingsReducer(
      prev,
      SettingsSliceActions.set({ fontScale: 1.5 }),
    );
    expect(state).toEqual({ theme: "dark", fontScale: 1.5 });
  });
});
