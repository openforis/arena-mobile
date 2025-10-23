import { useSelector } from "react-redux";

import { SurveyOptionsState } from "./state";

const getSurveyOptionsState = (state) => state[SurveyOptionsState.stateKey];

const selectRecordEditViewMode = (state) =>
  SurveyOptionsState.getRecordEditViewMode(getSurveyOptionsState(state));

export const SurveyOptionsSelectors = {
  selectRecordEditViewMode,

  useRecordEditViewMode: () => useSelector(selectRecordEditViewMode),
};
