import {createSelector} from 'reselect';

import {defaultCycle} from 'arena/config';
import {EMPTY_OBJECT} from 'infra/stateUtils';

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
  state => state?.ui || EMPTY_OBJECT,
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

export const getSurveyCycles = createSelector(
  getSurvey,
  survey => survey?.props?.cycles || EMPTY_OBJECT,
);

export const getSelectedSurveyCycles = createSelector(
  getSurveyCycles,
  cycles => Object.keys(cycles) || [defaultCycle],
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
    return survey.props?.defaultCycleKey || lastCycle || defaultCycle;
  },
);

export const getSurveyNumberOfCycles = createSelector(
  getSelectedSurveyCycles,
  cycles => cycles.length,
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
