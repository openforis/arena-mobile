import { useScreenKey } from "hooks/useScreenKey";

import type { RootState } from "../store";
import { useAppSelector } from "../storeHooks";
import { ScreenOptionsState } from "./state";

const selectScreenViewMode = (screenKey: string) => (state: RootState) =>
  ScreenOptionsState.getViewMode(screenKey)(state.screenOptions);

const useScreenViewMode = (screenKey: string) =>
  useAppSelector(selectScreenViewMode(screenKey));

export const ScreenOptionsSelectors = {
  selectScreenViewMode,
  useScreenViewMode,
  useCurrentScreenViewMode: () => useScreenViewMode(useScreenKey()),
};
