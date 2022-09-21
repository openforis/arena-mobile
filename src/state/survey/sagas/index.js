import {takeLatest, fork} from 'redux-saga/effects';

import surveyActionTypes from '../actionTypes';

import handleDeleteSurveyData from './deleteSurveyData';
import handleSelectSurvey from './selectSurvey';
import handleUploadData, {
  watchFileUploadChannel,
  watchUpdateJobChannel,
} from './uploadData';

export default function* () {
  yield takeLatest(surveyActionTypes.selectSurvey$, handleSelectSurvey);
  yield takeLatest(surveyActionTypes.uploadSurveyData$, handleUploadData);
  yield fork(watchFileUploadChannel);
  yield fork(watchUpdateJobChannel);
  yield takeLatest(surveyActionTypes.deleteSurveyData$, handleDeleteSurveyData);
}
