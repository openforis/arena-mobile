import {StackActions} from '@react-navigation/core';
import {takeLatest, put, select, call} from 'redux-saga/effects';

import {checkIfCurrentServerIsTheSurveysServer} from 'arena/survey';
import {handleShowToast} from 'infra/toast';
import {ROUTES} from 'navigation/constants';
import {selectors as appSelectors} from 'state/app';
import {actions as formActions} from 'state/form';
import * as navigator from 'state/navigatorService';
import {
  selectors as surveySelectors,
  actions as surveyActions,
} from 'state/survey';
import {selectors as surveysSelectors} from 'state/surveys';

import surveysActions from '../actionCreators';
import surveysActionTypes from '../actionTypes';
import surveysApi from '../api';

function* handleFetchSurvey({payload}) {
  try {
    const {surveyId, isUpdate = false} = payload;
    yield put(surveysActions.setLoading({isLoading: surveyId}));

    const serverUrl = yield select(appSelectors.getServerUrl);
    if (isUpdate) {
      const currentSurvey = yield select(state =>
        surveysSelectors.getSurveyById(state, surveyId),
      );

      yield call(checkIfCurrentServerIsTheSurveysServer, {
        survey: currentSurvey,
        serverUrl,
      });
    }

    const surveyWithNodeDefs = yield call(surveysApi.getSurveyPopulatedById, {
      serverUrl,
      surveyId,
    });

    yield put(
      surveysActions.setSurvey({
        survey: Object.assign({}, surveyWithNodeDefs, {serverUrl}),
      }),
    );
  } catch (e) {
    console.log(e);
    yield call(handleShowToast, {message: e?.message});
  } finally {
    console.log('Finally');

    yield put(surveysActions.setLoading({isLoading: false}));
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
