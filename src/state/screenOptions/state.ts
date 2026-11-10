import { Objects } from "@openforis/arena-core";

import { ScreenViewMode } from "model/ScreenViewMode";

const stateKey = "screenOptions";

const keys = {
  viewMode: "viewMode",
};

export type ScreenOptionsState = Record<string, { viewMode?: ScreenViewMode }>;

const getViewMode =
  (screenKey: string) =>
  (state: ScreenOptionsState): ScreenViewMode =>
    state?.[screenKey]?.viewMode ?? ScreenViewMode.table;

const assocViewMode =
  ({ screenKey, viewMode }: { screenKey: string; viewMode: ScreenViewMode }) =>
  (state: ScreenOptionsState): ScreenOptionsState =>
    Objects.assocPath({
      obj: state,
      path: [screenKey, keys.viewMode],
      value: viewMode,
    });

export const ScreenOptionsState = {
  stateKey,
  keys,

  getViewMode,
  assocViewMode,
};
