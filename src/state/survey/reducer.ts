import { Surveys } from "@openforis/arena-core";

import { StoreUtils } from "../storeUtils";

import { SurveyActionTypes } from "./actionTypes";
import { determinePreferredSurveyLanguage } from "./surveyStateUtils";

const actionHandlers = {
  [SurveyActionTypes.CURRENT_SURVEY_SET]: ({
    state,
    action
  }: any) => {
    const { survey, preferredLanguage = null } = action;

    return {
      ...state,
      currentSurvey: survey,
      currentSurveyPreferredLanguage:
        preferredLanguage ?? determinePreferredSurveyLanguage(survey),
      currentSurveyCycle: survey ? Surveys.getDefaultCycleKey(survey) : null,
    };
  },
  [SurveyActionTypes.CURRENT_SURVEY_PREFERRED_LANG_SET]: ({
    state,
    action
  }: any) => ({
    ...state,
    currentSurveyPreferredLanguage: action.lang,
  }),
  [SurveyActionTypes.CURRENT_SURVEY_CYCLE_SET]: ({
    state,
    action
  }: any) => ({
    ...state,
    currentSurveyCycle: action.cycleKey,
  }),
  [SurveyActionTypes.SURVEYS_LOCAL_SET]: ({
    state,
    action
  }: any) => ({
    ...state,
    surveysLocal: action.surveys,
  }),
};

export const SurveyReducer = StoreUtils.exportReducer({
  actionHandlers,
  initialState: false,
});
