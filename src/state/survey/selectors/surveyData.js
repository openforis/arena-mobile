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

const DEFAULT_VISUAL_DESCRIPTION = {
  /*backgroundColor: background,
  color: text,
  text: text,*/
  extras: [
    {
      type: 'BAND',
      backgroundColor: '#FF0000',
      color: '#000000',
      text: 'training',
      position: 'BOTTON',
    },
  ],
};

const getVisualDescription = createSelector(
  getSurvey,
  survey => survey?.props?.visualDescription || DEFAULT_VISUAL_DESCRIPTION,
);

export const getSurveyData = createSelector(
  getName,
  getLabel,
  getDescription,
  getSelectedSurveyLanguage,
  getSurveyCycle,
  getSurveyNumberOfCycles,
  getVisualDescription,
  (
    name,
    label,
    description,
    language,
    cycle,
    numberOfCycles,
    visualDescription,
  ) => ({
    name,
    label,
    description,
    language,
    cycle,
    numberOfCycles,
    visualDescription,
  }),
);
