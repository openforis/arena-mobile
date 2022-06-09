import {StackActions} from '@react-navigation/core';
import {takeLatest, put, select, call} from 'redux-saga/effects';

import {ROUTES} from 'navigation/constants';
import {selectors as appSelectors} from 'state/app';
import {actions as formActions} from 'state/form';
import * as navigator from 'state/navigatorService';
import {
  selectors as surveySelectors,
  actions as surveyActions,
} from 'state/survey';

import surveysActions from '../actionCreators';
import surveysActionTypes from '../actionTypes';
import surveysApi from '../api';

function* handleFetchSurvey({payload}) {
  try {
    const {surveyId} = payload;
    const serverUrl = yield select(appSelectors.getServerUrl);
    const surveyWithNodeDefs = yield call(surveysApi.getSurveyPopulatedById, {
      serverUrl,
      surveyId,
    });
    yield put(surveysActions.setSurvey({survey: surveyWithNodeDefs}));
  } catch (e) {
    console.log(e);
  } finally {
    console.log('Finally');
  }
}

function* handleDeleteSurvey({payload}) {
  const {surveyUuid, callBack} = payload;
  const selectedSurvey = yield select(surveySelectors.getSurvey);

  if (callBack) {
    yield call(callBack);
  } else {
    yield call(navigator.navigatorDispatch, StackActions.replace(ROUTES.HOME));
  }
  if (selectedSurvey?.uuid === surveyUuid) {
    yield put(surveyActions.cleanSurvey());
    yield put(formActions.clean());
  }
}

export default function* () {
  yield takeLatest(surveysActionTypes.fetchSurvey$, handleFetchSurvey);
  yield takeLatest(surveysActionTypes.updateSurvey$, handleFetchSurvey);
  yield takeLatest(surveysActionTypes.deleteSurvey$, handleDeleteSurvey);
}
