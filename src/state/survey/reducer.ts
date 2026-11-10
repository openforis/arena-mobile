import { Surveys } from "@openforis/arena-core";

import { ActionHandlers, StoreUtils } from "../storeUtils";

import { SurveyActionTypes } from "./actionTypes";
import type { SurveyState } from "./state";
import { determinePreferredSurveyLanguage } from "./surveyStateUtils";

const initialState: SurveyState = { surveysLocal: [] };

const actionHandlers: ActionHandlers<SurveyState> = {
  [SurveyActionTypes.CURRENT_SURVEY_SET]: ({ state, action }) => {
    const { survey, preferredLanguage = null } = action;

    return {
      ...state,
      currentSurvey: survey,
      currentSurveyPreferredLanguage:
        preferredLanguage ?? determinePreferredSurveyLanguage(survey),
      currentSurveyCycle: survey ? Surveys.getDefaultCycleKey(survey) : null,
      // switching survey invalidates the previously fetched user group; refetched by fetchCurrentSurveyUserGroup
      currentSurveyUserGroup: null,
      // not ready until fetchCurrentSurveyUserGroup resolves for this survey
      currentSurveyUserGroupReady: false,
    };
  },
  [SurveyActionTypes.CURRENT_SURVEY_PREFERRED_LANG_SET]: ({
    state,
    action,
  }) => ({
    ...state,
    currentSurveyPreferredLanguage: action.lang,
  }),
  [SurveyActionTypes.CURRENT_SURVEY_USER_GROUP_LOADING]: ({ state }) => ({
    ...state,
    currentSurveyUserGroupReady: false,
  }),
  [SurveyActionTypes.CURRENT_SURVEY_USER_GROUP_SET]: ({ state, action }) => ({
    ...state,
    currentSurveyUserGroup: action.userGroup,
    currentSurveyUserGroupReady: true,
  }),
  [SurveyActionTypes.CURRENT_SURVEY_USER_GROUP_RESET]: ({ state }) => ({
    ...state,
    currentSurveyUserGroup: null,
    currentSurveyUserGroupReady: false,
  }),
  [SurveyActionTypes.CURRENT_SURVEY_CYCLE_SET]: ({ state, action }) => ({
    ...state,
    currentSurveyCycle: action.cycleKey,
  }),
  [SurveyActionTypes.SURVEYS_LOCAL_SET]: ({ state, action }) => ({
    ...state,
    surveysLocal: action.surveys,
  }),
};

export const SurveyReducer = StoreUtils.exportReducer({
  actionHandlers,
  initialState,
});
