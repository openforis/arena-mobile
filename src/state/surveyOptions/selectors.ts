import type { RootState } from "../store";
import { SurveyOptionsState } from "./state";
import { useAppSelector } from "../storeHooks";

const selectRecordEditViewMode = (state: RootState) =>
  SurveyOptionsState.getRecordEditViewMode(state.surveyOptions);

const selectEntityListColumns = (entityDefUuid: string) => (state: RootState) =>
  SurveyOptionsState.getEntityListColumns(entityDefUuid)(state.surveyOptions);

export const SurveyOptionsSelectors = {
  selectRecordEditViewMode,
  selectEntityListColumns,

  useRecordEditViewMode: () => useAppSelector(selectRecordEditViewMode),
  useEntityListColumns: (entityDefUuid: string) =>
    useAppSelector(selectEntityListColumns(entityDefUuid)),
};
