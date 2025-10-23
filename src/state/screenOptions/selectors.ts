import { useSelector } from "react-redux";

// @ts-expect-error TS(2307): Cannot find module 'hooks' or its corresponding ty... Remove this comment to see the full error message
import { useScreenKey } from "hooks";
// @ts-expect-error TS(2307): Cannot find module 'model' or its corresponding ty... Remove this comment to see the full error message
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
