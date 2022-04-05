import {StackActions} from '@react-navigation/core';
import {takeLatest, put, select, call} from 'redux-saga/effects';

import {ROUTES} from 'navigation/constants';
import * as navigator from 'state/navigatorService';
import {selectors as surveysSelectors} from 'state/surveys';

import surveyActions from '../actionCreators';
import surveyActionTypes from '../actionTypes';

function* handleSelectSurvey({payload: {surveyId}} = {}) {
  try {
    const survey = yield select(state =>
      surveysSelectors.getSurveyById(state, {surveyId}),
    );

    yield put(surveyActions.setSurvey({survey}));
    yield call(
      navigator.navigatorDispatch,
      StackActions.replace(ROUTES.SURVEY),
    );
  } catch (error) {
    console.log('Error', error);
  } finally {
    console.log('Finally');
  }
}

function* handleUnselectSurvey() {
  yield put(surveyActions.cleanSurvey());
  yield call(navigator.navigatorDispatch, StackActions.replace(ROUTES.HOME));
}

export default function* () {
  yield takeLatest(surveyActionTypes.selectSurvey$, handleSelectSurvey);
  yield takeLatest(surveyActionTypes.unSelect$, handleUnselectSurvey);
}
