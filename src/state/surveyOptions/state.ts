import { ScreenViewMode } from "model/ScreenViewMode";

const stateKey = "surveyOptions";

const keys = {
  recordEditViewMode: "recordEditViewMode",
  viewModesByScreen: "viewModesByScreen",
};

const getRecordEditViewMode = (state) => state[keys.recordEditViewMode];
const getScreenViewMode = (screenKey) => (state) =>
  state?.[keys.viewModesByScreen]?.[screenKey] ?? ScreenViewMode.table;

export const SurveyOptionsState = {
  stateKey,
  keys,

  getRecordEditViewMode,
  getScreenViewMode,
};
