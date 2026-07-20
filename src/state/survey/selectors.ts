import { useSelector } from "react-redux";

import {
  LanguageCode,
  NodeDefEntity,
  Objects,
  SRSIndex,
  Survey,
  Surveys,
  UserGroup,
} from "@openforis/arena-core";

import { SurveyDefs } from "model";

import { determinePreferredSurveyLanguage } from "./surveyStateUtils";

const getSurveyState = (state: any) => state.survey;

const selectCurrentSurvey = (
  state: any,
): (Survey & { remoteId?: number }) | undefined =>
  getSurveyState(state).currentSurvey;

const selectCurrentSurveyIdUnsafe = (state: any): number | undefined =>
  selectCurrentSurvey(state)?.id;

const selectCurrentSurveyId = (state: any): number =>
  selectCurrentSurveyIdUnsafe(state) ?? 0;

const selectCurrentSurveySrsIndex = (state: any): SRSIndex | undefined => {
  const survey = selectCurrentSurvey(state);
  return survey ? Surveys.getSRSIndex(survey) : undefined;
};

const selectCurrentSurveyRootDef = (state: any): NodeDefEntity | undefined => {
  const survey = selectCurrentSurvey(state);
  return survey ? Surveys.getNodeDefRoot({ survey }) : undefined;
};

const selectIsNodeDefEnumerator =
  (nodeDef: any) =>
  (state: any): boolean => {
    const survey = selectCurrentSurvey(state);
    return survey ? Surveys.isNodeDefEnumerator({ survey, nodeDef }) : false;
  };

const selectIsNodeDefRootKey = (nodeDef: any) => (state: any) => {
  const survey = selectCurrentSurvey(state);
  const keyDefs = SurveyDefs.getRootKeyDefs({ survey });
  return keyDefs.some((keyDef) => keyDef === nodeDef);
};

const selectSurveysLocal = (state: any) => getSurveyState(state).surveysLocal;

const selectCurrentSurveyPreferredLang = (state: any): LanguageCode => {
  const preferredLang = getSurveyState(state).currentSurveyPreferredLanguage;
  if (preferredLang) return preferredLang;
  const survey = selectCurrentSurvey(state);
  return determinePreferredSurveyLanguage(survey)!;
};

const selectCurrentSurveyCycle = (state: any) =>
  getSurveyState(state).currentSurveyCycle;

const selectCurrentSurveyUserGroup = (state: any): UserGroup | null =>
  getSurveyState(state).currentSurveyUserGroup ?? null;

export const SurveySelectors = {
  selectCurrentSurvey,
  selectCurrentSurveyId,
  selectCurrentSurveyCycle,
  selectCurrentSurveyPreferredLang,
  selectCurrentSurveyUserGroup,

  useCurrentSurvey: () => useSelector(selectCurrentSurvey),
  useCurrentSurveyId: () => useSelector(selectCurrentSurveyId),
  useCurrentSurveySrsIndex: () =>
    useSelector(selectCurrentSurveySrsIndex, Objects.isEqual),
  useCurrentSurveyPreferredLang: () =>
    useSelector(selectCurrentSurveyPreferredLang),
  useCurrentSurveyCycle: () => useSelector(selectCurrentSurveyCycle),
  useCurrentSurveyUserGroup: () => useSelector(selectCurrentSurveyUserGroup),
  useCurrentSurveyRootDef: () => useSelector(selectCurrentSurveyRootDef),
  useIsNodeDefEnumerator: (nodeDef: any) =>
    useSelector(selectIsNodeDefEnumerator(nodeDef)),
  useIsNodeDefRootKey: (nodeDef: any) =>
    useSelector(selectIsNodeDefRootKey(nodeDef)),
  useSurveysLocal: () => useSelector(selectSurveysLocal),
};
