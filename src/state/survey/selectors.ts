import { useSelector } from "react-redux";

import { NodeDefEntity, Objects, Survey, Surveys } from "@openforis/arena-core";
import { SRSIndex } from "@openforis/arena-core/dist/srs";

import { SurveyDefs } from "model";

import { determinePreferredSurveyLanguage } from "./surveyStateUtils";

const getSurveyState = (state: any) => state.survey;

const selectCurrentSurvey = (state: any): Survey | undefined =>
  getSurveyState(state).currentSurvey;

const selectCurrentSurveyId = (state: any) => selectCurrentSurvey(state)?.id;

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

const selectCurrentSurveyPreferredLang = (state: any) => {
  const preferredLang = getSurveyState(state).currentSurveyPreferredLanguage;
  if (preferredLang) return preferredLang;
  const survey = selectCurrentSurvey(state);
  return determinePreferredSurveyLanguage(survey);
};

const selectCurrentSurveyCycle = (state: any) =>
  getSurveyState(state).currentSurveyCycle;

export const SurveySelectors = {
  selectCurrentSurvey,
  selectCurrentSurveyId,
  selectCurrentSurveyCycle,
  selectCurrentSurveyPreferredLang,

  useCurrentSurvey: () => useSelector(selectCurrentSurvey),
  useCurrentSurveyId: () => useSelector(selectCurrentSurveyId),
  useCurrentSurveySrsIndex: () =>
    useSelector(selectCurrentSurveySrsIndex, Objects.isEqual),
  useCurrentSurveyPreferredLang: () =>
    useSelector(selectCurrentSurveyPreferredLang),
  useCurrentSurveyCycle: () => useSelector(selectCurrentSurveyCycle),
  useCurrentSurveyRootDef: () => useSelector(selectCurrentSurveyRootDef),
  useIsNodeDefEnumerator: (nodeDef: any) =>
    useSelector(selectIsNodeDefEnumerator(nodeDef)),
  useIsNodeDefRootKey: (nodeDef: any) =>
    useSelector(selectIsNodeDefRootKey(nodeDef)),
  useSurveysLocal: () => useSelector(selectSurveysLocal),
};
