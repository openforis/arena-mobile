const stateKey = "surveyOptions";

const keys = {
  entityListColumnsByEntityDefUuid: "entityListColumnsByEntityDefUuid",
  recordEditViewMode: "recordEditViewMode",
};

const getRecordEditViewMode = (state: any) => state[keys.recordEditViewMode];
const getEntityListColumns =
  (entityDefUuid: string) =>
  (state: any): string[] | undefined =>
    state?.[keys.entityListColumnsByEntityDefUuid]?.[entityDefUuid];

export const SurveyOptionsState = {
  stateKey,
  keys,

  getRecordEditViewMode,
  getEntityListColumns,
};
