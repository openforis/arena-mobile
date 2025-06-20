import { useSelector } from "react-redux";

import { Objects, Surveys } from "@openforis/arena-core";

import { SurveyDefs } from "model";

import { determinePreferredSurveyLanguage } from "./surveyStateUtils";

const getSurveyState = (state) => state.survey;

const selectCurrentSurvey = (state) => getSurveyState(state).currentSurvey;

const selectCurrentSurveyId = (state) => selectCurrentSurvey(state)?.id;

const selectCurrentSurveySrsIndex = (state) => {
  const survey = selectCurrentSurvey(state);
  return Surveys.getSRSIndex(survey);
};

const selectCurrentSurveyRootDef = (state) => {
  const survey = selectCurrentSurvey(state);
  return Surveys.getNodeDefRoot({ survey });
};

const selectIsNodeDefEnumerator = (nodeDef) => (state) => {
  const survey = selectCurrentSurvey(state);
  return Surveys.isNodeDefEnumerator({ survey, nodeDef });
};

const selectIsNodeDefRootKey = (nodeDef) => (state) => {
  const survey = selectCurrentSurvey(state);
  const keyDefs = SurveyDefs.getRootKeyDefs({ survey });
  return keyDefs.some((keyDef) => keyDef === nodeDef);
};

const selectSurveysLocal = (state) => getSurveyState(state).surveysLocal;

const selectCurrentSurveyPreferredLang = (state) => {
  const preferredLang = getSurveyState(state).currentSurveyPreferredLanguage;
  if (preferredLang) return preferredLang;
  const survey = selectCurrentSurvey(state);
  return determinePreferredSurveyLanguage(survey);
};

const selectCurrentSurveyCycle = (state) =>
  getSurveyState(state).currentSurveyCycle;

export const SurveySelectors = {
  selectCurrentSurvey,
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
  useIsNodeDefEnumerator: (nodeDef) =>
    useSelector(selectIsNodeDefEnumerator(nodeDef)),
  useIsNodeDefRootKey: (nodeDef) =>
    useSelector(selectIsNodeDefRootKey(nodeDef)),
  useSurveysLocal: () => useSelector(selectSurveysLocal),
};
