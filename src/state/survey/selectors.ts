import {
  LanguageCode,
  Objects,
  SRSIndex,
  Survey,
  Surveys,
  UserGroup,
} from "@openforis/arena-core";

import { SurveyDefs } from "model";
import { SurveyService } from "service";

import { determinePreferredSurveyLanguage } from "./surveyStateUtils";
import type { RootState } from "../store";
import { useAppSelector } from "../storeHooks";

const getSurveyState = (state: RootState) => state.survey;

const selectCurrentSurvey = (
  state: RootState,
): (Survey & { remoteId?: number }) | undefined =>
  getSurveyState(state).currentSurvey;

const selectIsCurrentSurveyDemo = (state: RootState): boolean =>
  selectCurrentSurvey(state)?.uuid === SurveyService.demoSurveyUuid;

const selectCurrentSurveyIdUnsafe = (state: RootState): number | undefined =>
  selectCurrentSurvey(state)?.id;

const selectCurrentSurveyId = (state: RootState): number =>
  selectCurrentSurveyIdUnsafe(state) ?? 0;

const selectCurrentSurveySrsIndex = (
  state: RootState,
): SRSIndex | undefined => {
  const survey = selectCurrentSurvey(state);
  return survey ? Surveys.getSRSIndex(survey) : undefined;
};

const selectIsNodeDefEnumerator =
  (nodeDef: any) =>
  (state: RootState): boolean => {
    const survey = selectCurrentSurvey(state);
    return survey ? Surveys.isNodeDefEnumerator({ survey, nodeDef }) : false;
  };

const selectIsNodeDefRootKey = (nodeDef: any) => (state: RootState) => {
  const survey = selectCurrentSurvey(state);
  const keyDefs = SurveyDefs.getRootKeyDefs({ survey });
  return keyDefs.includes(nodeDef);
};

const selectSurveysLocal = (state: RootState) =>
  getSurveyState(state).surveysLocal;

const selectCurrentSurveyPreferredLang = (state: RootState): LanguageCode => {
  const preferredLang = getSurveyState(state).currentSurveyPreferredLanguage;
  if (preferredLang) return preferredLang;
  const survey = selectCurrentSurvey(state);
  return determinePreferredSurveyLanguage(survey)!;
};

const selectCurrentSurveyCycle = (state: RootState): string | undefined =>
  getSurveyState(state).currentSurveyCycle ?? undefined;

const selectCurrentSurveyUserGroup = (state: RootState): UserGroup | null =>
  getSurveyState(state).currentSurveyUserGroup ?? null;

// True once fetchCurrentSurveyUserGroup has resolved (successfully or not) for the current survey.
// False right after switching survey, while the fetch is still pending: at that point
// currentSurveyUserGroup being null is ambiguous (not yet fetched vs. genuinely no group).
const selectCurrentSurveyUserGroupReady = (state: RootState): boolean =>
  getSurveyState(state).currentSurveyUserGroupReady ?? false;

export const SurveySelectors = {
  selectCurrentSurvey,
  selectCurrentSurveyId,
  selectCurrentSurveyCycle,
  selectCurrentSurveyPreferredLang,
  selectCurrentSurveyUserGroup,
  selectCurrentSurveyUserGroupReady,
  selectIsCurrentSurveyDemo,

  useCurrentSurvey: () => useAppSelector(selectCurrentSurvey),
  useIsCurrentSurveyDemo: () => useAppSelector(selectIsCurrentSurveyDemo),
  useCurrentSurveyId: () => useAppSelector(selectCurrentSurveyId),
  useCurrentSurveySrsIndex: () =>
    useAppSelector(selectCurrentSurveySrsIndex, Objects.isEqual),
  useCurrentSurveyPreferredLang: () =>
    useAppSelector(selectCurrentSurveyPreferredLang),
  useCurrentSurveyCycle: () => useAppSelector(selectCurrentSurveyCycle),
  useCurrentSurveyUserGroup: () => useAppSelector(selectCurrentSurveyUserGroup),
  useCurrentSurveyUserGroupReady: () =>
    useAppSelector(selectCurrentSurveyUserGroupReady),
  useIsNodeDefEnumerator: (nodeDef: any) =>
    useAppSelector(selectIsNodeDefEnumerator(nodeDef)),
  useIsNodeDefRootKey: (nodeDef: any) =>
    useAppSelector(selectIsNodeDefRootKey(nodeDef)),
  useSurveysLocal: () => useAppSelector(selectSurveysLocal),
};
