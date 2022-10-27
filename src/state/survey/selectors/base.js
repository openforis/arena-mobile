import {createSelector} from 'reselect';

import {defaultCycle} from 'arena/config';

const getState = state => state;
const getSurveyState = createSelector(
  getState,
  state => state?.survey || false,
);
export const getSurvey = createSelector(
  getSurveyState,
  state => (state?.data && state?.data.uuid ? state?.data : false),
  {
    memoizeOptions: {maxSize: 10},
  },
);

export const getUiState = createSelector(
  getSurveyState,
  state => state?.ui || {},
);

export const getSelectedSurveyId = createSelector(
  getSurvey,
  survey => survey?.id,
);

export const getSelectedSurveyUuid = createSelector(
  getSurvey,
  survey => survey?.uuid,
);

export const getSelectedSurveyLanguage = createSelector(
  getUiState,
  ui => ui.selectedSurveyLanguage,
);

export const getSelectedSurveyLanguages = createSelector(
  getSurvey,
  survey => survey?.props?.languages,
);

export const getSelectedSurveyCycles = createSelector(
  getSurvey,
  survey => Object.keys(survey?.props?.cycles || {}) || [defaultCycle],
);

export const getSurveyCycle = createSelector(
  getUiState,
  getSurvey,
  getSelectedSurveyCycles,
  (ui, survey, surveyCycles) => {
    if (ui?.selectedSurveyCycle) {
      return ui?.selectedSurveyCycle;
    }
    const lastCycle = surveyCycles.pop();
    return survey.props?.defaultCycle || lastCycle || defaultCycle;
  },
);

export const getSurveySRS = createSelector(
  getSurvey,
  survey => survey?.props?.srs || [],
);
export const getRefData = createSelector(getSurvey, survey => survey?.refData);

export const getCategoryItemIndex = createSelector(
  getRefData,
  refData => refData?.categoryItemIndex,
);

export const getTaxonIndex = createSelector(
  getRefData,
  refData => refData.taxonIndex,
);
export const getTaxonUuidIndex = createSelector(
  getRefData,
  refData => refData.taxonUuidIndex,
);
