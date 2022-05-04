import {StackActions} from '@react-navigation/core';
import {takeLatest, put, select, call} from 'redux-saga/effects';

import {ROUTES} from 'navigation/constants';
import * as navigator from 'state/navigatorService';
import surveysSelectors from 'state/surveys/selectors';

import surveyActions from '../actionCreators';
import surveyActionTypes from '../actionTypes';

function* handleSelectSurvey({payload}) {
  try {
    const {surveyUuid} = payload;
    const survey = yield select(state =>
      surveysSelectors.getSurveyByUuid(state, {surveyUuid}),
    );

    if (!survey) {
      throw Error('Missing survey');
    }
    yield put(surveyActions.setSurvey({survey}));
    yield call(navigator.navigatorDispatch, StackActions.replace(ROUTES.HOME));
  } catch (error) {
    console.log('Error', error.message);
  } finally {
    console.log('Finally');
  }
}

export default function* () {
  yield takeLatest(surveyActionTypes.selectSurvey$, handleSelectSurvey);
}
