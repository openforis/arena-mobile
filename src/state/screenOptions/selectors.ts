import { useSelector } from "react-redux";

import { useScreenKey } from "hooks";
import { ScreenViewMode } from "model";

import { ScreenOptionsState } from "./state";

const getScreenOptionsState = (state: any) => state[ScreenOptionsState.stateKey];

const selectScreenViewMode = (screenKey: any) => (state: any) => ScreenOptionsState.getViewMode(screenKey)(getScreenOptionsState(state));

const useScreenViewMode = (screenKey: any) => useSelector(selectScreenViewMode(screenKey));

export const ScreenOptionsSelectors = {
  selectScreenViewMode,
  useScreenViewMode,
  useCurrentScreenViewMode: () => useScreenViewMode(useScreenKey()),
  useIsCurrentScreenViewAsList: () =>
    useScreenViewMode(useScreenKey()) === ScreenViewMode.list,
};
