import {takeLatest} from 'redux-saga/effects';

import surveysActionTypes from '../actionTypes';

import handleDeleteSurvey from './deleteSurvey';
import handleFetchSurvey from './fetchSurvey';

export default function* () {
  yield takeLatest(surveysActionTypes.fetchSurvey$, handleFetchSurvey);
  yield takeLatest(surveysActionTypes.updateSurvey$, handleFetchSurvey);
  yield takeLatest(surveysActionTypes.deleteSurvey$, handleDeleteSurvey);
}
