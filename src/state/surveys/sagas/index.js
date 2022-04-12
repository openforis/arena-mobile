import {takeLatest, put, select, call} from 'redux-saga/effects';

import {selectors as appSelectors} from 'state/app';
import {
  selectors as surveySelectors,
  actions as surveyActions,
} from 'state/survey';

import surveysActions from '../actionCreators';
import surveysActionTypes from '../actionTypes';
import surveysApi from '../api';

function* handleFetchSurvey({payload: {surveyId}} = {}) {
  try {
    const serverUrl = yield select(appSelectors.getServerUrl);
    const surveyWithNodeDefs = yield call(surveysApi.getSurveyPopulatedById, {
      serverUrl,
      surveyId,
    });
    yield put(surveysActions.setSurvey({survey: surveyWithNodeDefs}));
  } catch (e) {
    console.log(e);
  }
}

function* handleDeleteSurvey({payload: {surveyId, callBack}} = {}) {
  const selectedSurvey = yield select(surveySelectors.getSurvey);
  if (selectedSurvey?.info?.id === surveyId) {
    yield call(surveyActions.unSelect);
  }
  yield put(surveysActions.removeSurvey({surveyId}));
  if (callBack) {
    yield call(callBack);
  }
}

function* handleSelectSurvey({payload}) {
  yield put(surveyActions.selectSurvey(payload));
}

export default function* () {
  yield takeLatest(surveysActionTypes.fetchSurvey$, handleFetchSurvey);
  yield takeLatest(surveysActionTypes.updateSurvey$, handleFetchSurvey);
  yield takeLatest(surveysActionTypes.deleteSurvey$, handleDeleteSurvey);
  yield takeLatest(surveysActionTypes.selectSurvey$, handleSelectSurvey);
}
