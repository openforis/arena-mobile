import { Objects } from "@openforis/arena-core";

// @ts-expect-error TS(2307): Cannot find module 'model/ScreenViewMode' or its c... Remove this comment to see the full error message
import { ScreenViewMode } from "model/ScreenViewMode";

const stateKey = "screenOptions";

const keys = {
  viewMode: "viewMode",
};

const getViewMode = (screenKey: any) => (state: any) => state?.[screenKey]?.[keys.viewMode] ?? ScreenViewMode.table;

const assocViewMode =
  ({
    screenKey,
    viewMode
  }: any) =>
  (state: any) => Objects.assocPath({
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
