import { ScreenViewMode } from "model/ScreenViewMode";

const stateKey = "surveyOptions";

const keys = {
  recordEditViewMode: "recordEditViewMode",
  viewModesByScreen: "viewModesByScreen",
};

const getRecordEditViewMode = (state: any) => state[keys.recordEditViewMode];
const getScreenViewMode = (screenKey: any) => (state: any) => state?.[keys.viewModesByScreen]?.[screenKey] ?? ScreenViewMode.table;

export const SurveyOptionsState = {
  stateKey,
  keys,

  getRecordEditViewMode,
  getScreenViewMode,
};
