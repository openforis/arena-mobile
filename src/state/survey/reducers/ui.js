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
    [actions.selectSurveyCycle]: (state, {payload: {selectedSurveyCycle}}) => ({
      ...state,
      selectedSurveyCycle,
    }),
    [actions.setSurvey]: (state, {payload: {survey = {}}}) => ({
      ...state,
      selectedSurveyLanguage: survey?.props?.languages?.[0],
    }),
    [actions.setUploading]: (state, {payload: {isUploading = false}}) => ({
      ...state,
      isUploading,
      uploadProgress: 0,
    }),
    [actions.setUploadProgress]: (state, {payload: {uploadProgress = 0}}) => ({
      ...state,
      uploadProgress,
    }),
    [actions.updateJob]: (state, {payload: {job}}) => ({
      ...state,
      job,
    }),
    [globalActions.reset]: () => initialState.ui || {},
  },
  initialState.ui || {},
);

export default ui;
