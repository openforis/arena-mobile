import {createSelector} from 'reselect';

const getState = state => state;
const getSurveyState = createSelector(getState, state => state?.survey || {});
const getSurveyStateData = createSelector(
  getSurveyState,
  state => state?.data || {},
);

const getUiState = createSelector(getSurveyState, state => state?.ui || {});

const getSelectedSurveyId = createSelector(
  getSurveyStateData,
  survey => survey?.info?.id,
);

const getSurvey = getSurveyStateData;

const getSelectedSurveyLanguage = createSelector(
  getUiState,
  ui => ui.selectedSurveyLanguage,
);

export default {
  getSurvey,
  getSelectedSurveyId,
  getSelectedSurveyLanguage,
};
