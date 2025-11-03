import { useSelector } from "react-redux";

import { SurveyOptionsState } from "./state";

const getSurveyOptionsState = (state: any) => state[SurveyOptionsState.stateKey];

const selectRecordEditViewMode = (state: any) => SurveyOptionsState.getRecordEditViewMode(getSurveyOptionsState(state));

export const SurveyOptionsSelectors = {
  selectRecordEditViewMode,

  useRecordEditViewMode: () => useSelector(selectRecordEditViewMode),
};
