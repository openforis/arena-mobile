import {createSelector} from 'reselect';

import {
  getSurvey,
  getSelectedSurveyLanguage,
  getSurveyCycle,
  getSurveyNumberOfCycles,
} from './base';

const getName = createSelector(getSurvey, survey => survey?.props?.name);

const getLabels = createSelector(getSurvey, survey => survey?.props?.labels);
const getDescriptions = createSelector(
  getSurvey,
  survey => survey?.props?.descriptions,
);

const getLabel = createSelector(
  getLabels,
  getSelectedSurveyLanguage,
  (labels, language) => labels?.[language],
);
const getDescription = createSelector(
  getDescriptions,
  getSelectedSurveyLanguage,
  (descriptions, language) => descriptions?.[language],
);

export const getSurveyData = createSelector(
  getName,
  getLabel,
  getDescription,
  getSelectedSurveyLanguage,
  getSurveyCycle,
  getSurveyNumberOfCycles,
  (name, label, description, language, cycle, numberOfCycles) => ({
    name,
    label,
    description,
    language,
    cycle,
    numberOfCycles,
  }),
);
