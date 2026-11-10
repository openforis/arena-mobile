const stateKey = "surveyOptions";

const keys = {
  entityListColumnsByEntityDefUuid: "entityListColumnsByEntityDefUuid",
  recordEditViewMode: "recordEditViewMode",
};

export type SurveyOptionsState = {
  entityListColumnsByEntityDefUuid?: Record<string, string[]>;
  recordEditViewMode: string;
};

const getRecordEditViewMode = (state: SurveyOptionsState) =>
  state.recordEditViewMode;
const getEntityListColumns =
  (entityDefUuid: string) =>
  (state: SurveyOptionsState): string[] | undefined =>
    state?.entityListColumnsByEntityDefUuid?.[entityDefUuid];

export const SurveyOptionsState = {
  stateKey,
  keys,

  getRecordEditViewMode,
  getEntityListColumns,
};
