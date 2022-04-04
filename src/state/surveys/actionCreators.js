import {createActions} from 'redux-actions';

import types from './actionTypes';

const {surveys} = createActions({
  [types.fetchSurvey$]: ({surveyId}) => ({surveyId}),
  [types.updateSurvey$]: ({surveyId}) => ({surveyId}),
  [types.deleteSurvey$]: ({surveyId, callBack}) => ({surveyId, callBack}),
  [types.selectSurvey$]: ({surveyId}) => ({surveyId}),
  [types.SET_SURVEY]: ({survey}) => ({survey}),
  [types.REMOVE_SURVEY]: ({surveyId}) => ({surveyId}),
  /*ui*/
  [types.SET_LOADING]: ({isLoading = false}) => ({
    isLoading,
  }),
  [types.SET_ERROR]: ({error = false}) => ({
    error,
  }),
});

export default surveys;
