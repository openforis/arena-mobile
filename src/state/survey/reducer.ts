import { LanguageCode, Surveys, ArenaUserGroup } from "@openforis/arena-core";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { SurveyState } from "./state";
import { determinePreferredSurveyLanguage } from "./surveyStateUtils";

const initialState: SurveyState = { surveysLocal: [] };

const surveySlice = createSlice({
  name: "survey",
  initialState,
  reducers: {
    currentSurveySet: (
      state,
      action: PayloadAction<{
        survey: SurveyState["currentSurvey"];
        preferredLanguage?: LanguageCode | null;
      }>,
    ) => {
      const { survey, preferredLanguage = null } = action.payload;
      state.currentSurvey = survey;
      state.currentSurveyPreferredLanguage =
        preferredLanguage ?? determinePreferredSurveyLanguage(survey);
      state.currentSurveyCycle = survey
        ? Surveys.getDefaultCycleKey(survey)
        : null;
      // switching survey invalidates the previously fetched user group; refetched by fetchCurrentSurveyUserGroup
      state.currentSurveyUserGroup = null;
      // not ready until fetchCurrentSurveyUserGroup resolves for this survey
      state.currentSurveyUserGroupReady = false;
    },
    currentSurveyPreferredLanguageSet: (
      state,
      action: PayloadAction<LanguageCode | null>,
    ) => {
      state.currentSurveyPreferredLanguage = action.payload;
    },
    currentSurveyCycleSet: (
      state,
      action: PayloadAction<string | null | undefined>,
    ) => {
      state.currentSurveyCycle = action.payload;
    },
    currentSurveyUserGroupLoading: (state) => {
      state.currentSurveyUserGroupReady = false;
    },
    currentSurveyUserGroupSet: (
      state,
      action: PayloadAction<ArenaUserGroup | null | undefined>,
    ) => {
      state.currentSurveyUserGroup = action.payload;
      state.currentSurveyUserGroupReady = true;
    },
    currentSurveyUserGroupReset: (state) => {
      state.currentSurveyUserGroup = null;
      state.currentSurveyUserGroupReady = false;
    },
    surveysLocalSet: (state, action: PayloadAction<any[]>) => {
      state.surveysLocal = action.payload;
    },
  },
});

export const SurveySliceActions = surveySlice.actions;
export const SurveyReducer = surveySlice.reducer;
