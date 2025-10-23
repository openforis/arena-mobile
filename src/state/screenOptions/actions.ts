import { ScreenViewMode } from "model";
import { ScreenOptionsSelectors } from "./selectors";

const SCREEN_VIEW_MODE_SET = "SCREEN_VIEW_MODE_SET";

const setScreenViewMode =
  ({ screenKey, viewMode }) =>
  (dispatch) => {
    dispatch({ type: SCREEN_VIEW_MODE_SET, screenKey, viewMode });
  };

const toggleScreenViewMode =
  ({ screenKey }) =>
  (dispatch, getState) => {
    const state = getState();

    const viewMode =
      ScreenOptionsSelectors.selectScreenViewMode(screenKey)(state);

    const viewModeNext =
      viewMode === ScreenViewMode.table
        ? ScreenViewMode.list
        : ScreenViewMode.table;

    dispatch({ type: SCREEN_VIEW_MODE_SET, screenKey, viewMode: viewModeNext });
  };

export const ScreenOptionsActions = {
  SCREEN_VIEW_MODE_SET,

  setScreenViewMode,
  toggleScreenViewMode,
};
