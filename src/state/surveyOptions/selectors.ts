import { useSelector } from "react-redux";

import { SurveyOptionsState } from "./state";

const getSurveyOptionsState = (state: any) =>
  state[SurveyOptionsState.stateKey];

const selectRecordEditViewMode = (state: any) =>
  SurveyOptionsState.getRecordEditViewMode(getSurveyOptionsState(state));

const selectEntityListColumns = (entityDefUuid: string) => (state: any) =>
  SurveyOptionsState.getEntityListColumns(entityDefUuid)(
    getSurveyOptionsState(state),
  );

export const SurveyOptionsSelectors = {
  selectRecordEditViewMode,
  selectEntityListColumns,

  useRecordEditViewMode: () => useSelector(selectRecordEditViewMode),
  useEntityListColumns: (entityDefUuid: string) =>
    useSelector(selectEntityListColumns(entityDefUuid)),
};
