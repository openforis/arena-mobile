import { ScreenViewMode } from "model";
import { ScreenOptionsSelectors } from "./selectors";

const SCREEN_VIEW_MODE_SET = "SCREEN_VIEW_MODE_SET";

const setScreenViewMode =
  ({
    screenKey,
    viewMode
  }: any) =>
  (dispatch: any) => {
    dispatch({ type: SCREEN_VIEW_MODE_SET, screenKey, viewMode });
  };

const toggleScreenViewMode =
  ({
    screenKey
  }: any) =>
  (dispatch: any, getState: any) => {
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
