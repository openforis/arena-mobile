import {createSelector} from 'reselect';

import recordsSelectors from 'state/records/selectors';

const getState = state => state;
const getSurveyState = createSelector(
  getState,
  state => state?.survey || false,
);
const getSurveyStateData = createSelector(getSurveyState, state =>
  state?.data && Object.values(state?.data).length > 0 ? state?.data : false,
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

const getRecords = createSelector(
  getSurvey,
  recordsSelectors.getRecords,
  (survey, records) =>
    records.filter(record => record.surveyUuid === survey.info.uuid),
);

export default {
  getSurvey,
  getSelectedSurveyId,
  getSelectedSurveyLanguage,
  getRecords,
};
