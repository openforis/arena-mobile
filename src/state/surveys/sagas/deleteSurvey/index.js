import {StackActions} from '@react-navigation/core';
import {put, select, call} from 'redux-saga/effects';

import {ROUTES} from 'navigation/constants';
import {cleanSurvey} from 'state/__persistence';
import {actions as formActions} from 'state/form';
import * as navigator from 'state/navigatorService';
import {
  selectors as surveySelectors,
  actions as surveyActions,
} from 'state/survey';

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
  yield call(cleanSurvey, {surveyUuid});
}

export default handleDeleteSurvey;
