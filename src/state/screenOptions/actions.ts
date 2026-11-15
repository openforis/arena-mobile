import { ScreenViewMode } from "model";
import { ScreenOptionsSliceActions } from "./reducer";
import { ScreenOptionsSelectors } from "./selectors";
import type { AppDispatch, AppGetState } from "../store";

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
  (dispatch: AppDispatch, getState: AppGetState) => {
    const state = getState();

    const viewMode =
      ScreenOptionsSelectors.selectScreenViewMode(screenKey)(state);

    const viewModeNext = getNextViewMode({ viewMode, viewModes });

    dispatch(
      ScreenOptionsSliceActions.setViewMode({
        screenKey,
        viewMode: viewModeNext,
      }),
    );
  };

export const ScreenOptionsActions = {
  getNextViewMode,
  toggleScreenViewMode,
};
