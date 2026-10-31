import { ScreenViewMode } from "model";
import { ScreenOptionsSelectors } from "./selectors";

const SCREEN_VIEW_MODE_SET = "SCREEN_VIEW_MODE_SET";

const defaultViewModes = [ScreenViewMode.table, ScreenViewMode.list];

const getNextViewMode = ({
  viewMode,
  viewModes = defaultViewModes,
}: {
  viewMode: ScreenViewMode;
  viewModes?: ScreenViewMode[];
}): ScreenViewMode =>
  viewModes[(viewModes.indexOf(viewMode) + 1) % viewModes.length]!;

const toggleScreenViewMode =
  ({
    screenKey,
    viewModes,
  }: {
    screenKey: string;
    viewModes?: ScreenViewMode[];
  }) =>
  (dispatch: any, getState: any) => {
    const state = getState();

    const viewMode =
      ScreenOptionsSelectors.selectScreenViewMode(screenKey)(state);

    const viewModeNext = getNextViewMode({ viewMode, viewModes });

    dispatch({ type: SCREEN_VIEW_MODE_SET, screenKey, viewMode: viewModeNext });
  };

export const ScreenOptionsActions = {
  SCREEN_VIEW_MODE_SET,

  getNextViewMode,
  toggleScreenViewMode,
};
