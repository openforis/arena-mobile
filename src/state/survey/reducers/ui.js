import {handleActions} from 'redux-actions';

import globalActions from 'state/globalActions';

import actions from '../actionCreators';
import initialState from '../initial.state';

const ui = handleActions(
  {
    [actions.setLoading]: (state, {payload: {isLoading}}) => ({
      ...state,
      isLoading: isLoading,
    }),
    [actions.setError]: (state, {payload: {error}}) => ({
      ...state,
      error: error,
    }),
    [actions.selectSurveyLanguage]: (
      state,
      {payload: {selectedSurveyLanguage}},
    ) => ({
      ...state,
      selectedSurveyLanguage,
    }),
    [actions.setSurvey]: (state, {payload: {survey = {}}}) => ({
      ...state,
      selectedSurveyLanguage: survey?.props?.languages?.[0],
    }),
    [globalActions.reset]: () => initialState.ui || {},
  },
  initialState.ui || {},
);

export default ui;
