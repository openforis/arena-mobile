import {createSelector} from 'reselect';

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

// TODO change when cycle
export const getSurveyCycle = createSelector(
  getUiState,
  ui => ui.selectedSurveyCycle || '0',
);

export const getSelectedSurveyCycles = createSelector(getSurvey, survey =>
  Object.keys(survey.props.cycles),
);

export const getSurveySRS = createSelector(
  getSurvey,
  survey => survey?.props?.srs || [],
);
export const getRefData = createSelector(getSurvey, survey => survey?.refData);
