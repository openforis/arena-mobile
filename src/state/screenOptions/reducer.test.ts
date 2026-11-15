import { ScreenViewMode } from "model/ScreenViewMode";
import { screenKeys } from "screens/screenKeys";

import { ScreenOptionsReducer, ScreenOptionsSliceActions } from "./reducer";
import { ScreenOptionsState } from "./state";

describe("ScreenOptionsReducer", () => {
  it("uses cards for the surveys lists by default", () => {
    const state = ScreenOptionsReducer(undefined, { type: "@@INIT" });
    expect(
      ScreenOptionsState.getViewMode(screenKeys.surveysListLocal)(state),
    ).toBe(ScreenViewMode.cards);
    expect(ScreenOptionsState.getViewMode("other")(state)).toBe(
      ScreenViewMode.table,
    );
  });

  it("sets the view mode of a screen without affecting the others", () => {
    const state = ScreenOptionsReducer(
      undefined,
      ScreenOptionsSliceActions.setViewMode({
        screenKey: "recordsList",
        viewMode: ScreenViewMode.list,
      }),
    );
    expect(state.recordsList).toEqual({ viewMode: ScreenViewMode.list });
    expect(
      ScreenOptionsState.getViewMode(screenKeys.surveysListRemote)(state),
    ).toBe(ScreenViewMode.cards);
  });
});
