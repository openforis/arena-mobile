import {createActions} from 'redux-actions';

import types from './actionTypes';

const {survey} = createActions({
  [types.selectSurvey$]: ({surveyUuid}) => ({surveyUuid}),
  [types.deleteSurveyData$]: ({surveyUuid = false} = {}) => ({surveyUuid}),
  [types.uploadSurveyData$]: () => ({}),
  [types.shareSurveyData$]: () => ({}),
  [types.SET_SURVEY]: ({survey: _survey}) => ({survey: _survey}),
  [types.UPDATE_JOB]: ({job}) => ({job}),

  [types.CLEAN_SURVEY]: () => ({}),
  [types.SELECT_SURVEY_LANGUAGE]: ({selectedSurveyLanguage}) => ({
    selectedSurveyLanguage,
  }),
  [types.SELECT_SURVEY_CYCLE]: ({selectedSurveyCycle}) => ({
    selectedSurveyCycle,
  }),
  [types.SET_UPLOADING]: ({isUploading = false}) => ({isUploading}),
  [types.SET_UPLOAD_PROGRESS]: ({uploadProgress}) => ({uploadProgress}),
});

export default survey;
