import { useSelector } from "react-redux";

import { useScreenKey } from "hooks";

import { ScreenOptionsState } from "./state";

const getScreenOptionsState = (state) => state[ScreenOptionsState.stateKey];

const selectScreenViewMode = (screenKey) => (state) =>
  ScreenOptionsState.getViewMode(screenKey)(getScreenOptionsState(state));

const useScreenViewMode = (screenKey) =>
  useSelector(selectScreenViewMode(screenKey));

export const ScreenOptionsSelectors = {
  selectScreenViewMode,
  useScreenViewMode,
  useCurrentScreenViewMode: () => useScreenViewMode(useScreenKey()),
};
