import {createActions} from 'redux-actions';

import types from './actionTypes';

const {surveys} = createActions({
  [types.fetchSurvey$]: ({surveyId}) => ({surveyId}),
  [types.updateSurvey$]: ({surveyId}) => ({surveyId, isUpdate: true}),
  [types.deleteSurvey$]: ({surveyUuid, callBack}) => ({surveyUuid, callBack}),
  [types.SET_SURVEY]: ({survey}) => ({survey}),
  /*ui*/
  [types.SET_LOADING]: ({isLoading = false}) => ({
    isLoading,
  }),
  [types.SET_ERROR]: ({error = false}) => ({
    error,
  }),
});

export default surveys;
