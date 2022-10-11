import {createSelector} from 'reselect';

import {getSurvey, getSelectedSurveyLanguage, getSurveyCycle} from './base';

const getName = createSelector(getSurvey, survey => survey?.props?.name);

const getLabels = createSelector(getSurvey, survey => survey?.props?.labels);

const getLabel = createSelector(
  getLabels,
  getSelectedSurveyLanguage,
  (labels, language) => labels?.[language],
);

export const getSurveyData = createSelector(
  getName,
  getLabel,
  getSelectedSurveyLanguage,
  getSurveyCycle,
  (name, label, language, cycle) => ({
    name,
    label,
    language,
    cycle,
  }),
);
