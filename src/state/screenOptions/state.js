import { Objects } from "@openforis/arena-core";

import { ScreenViewMode } from "model/ScreenViewMode";

const stateKey = "screenOptions";

const keys = {
  viewMode: "viewMode",
};

const getViewMode = (screenKey) => (state) =>
  state?.[screenKey]?.[keys.viewMode] ?? ScreenViewMode.table;

const assocViewMode =
  ({ screenKey, viewMode }) =>
  (state) =>
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
