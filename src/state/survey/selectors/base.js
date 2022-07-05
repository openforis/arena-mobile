import {createSelector} from 'reselect';

const getState = state => state;
const getSurveyState = createSelector(
  getState,
  state => state?.survey || false,
);
export const getSurvey = createSelector(getSurveyState, state =>
  state?.data && state?.data.uuid ? state?.data : false,
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

export const getRefData = createSelector(getSurvey, survey => survey?.refData);
