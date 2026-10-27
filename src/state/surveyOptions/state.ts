import { ScreenViewMode } from "model/ScreenViewMode";

const stateKey = "surveyOptions";

const keys = {
  entityListColumnsByEntityDefUuid: "entityListColumnsByEntityDefUuid",
  recordEditViewMode: "recordEditViewMode",
  viewModesByScreen: "viewModesByScreen",
};

const getRecordEditViewMode = (state: any) => state[keys.recordEditViewMode];
const getScreenViewMode = (screenKey: any) => (state: any) => state?.[keys.viewModesByScreen]?.[screenKey] ?? ScreenViewMode.table;
const getEntityListColumns =
  (entityDefUuid: string) =>
  (state: any): string[] | undefined =>
    state?.[keys.entityListColumnsByEntityDefUuid]?.[entityDefUuid];

export const SurveyOptionsState = {
  stateKey,
  keys,

  getRecordEditViewMode,
  getScreenViewMode,
  getEntityListColumns,
};
