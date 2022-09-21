import {StackActions} from '@react-navigation/core';
import {takeLatest, put, select, call, all} from 'redux-saga/effects';

import {ROUTES} from 'navigation/constants';
import {cleanAllData} from 'state/__persistence';
import globalActions from 'state/globalActions';
import * as navigator from 'state/navigatorService';
import surveysSelectors from 'state/surveys/selectors';
import {actions as userActions} from 'state/user';

import appActions from '../actionCreators';
import appActionTypes from '../actionTypes';
import appApi from '../api';
import appSelectors from '../selectors';

function* handleAuthenticateUser() {
  let hasToNavigate = false;
  try {
    yield all([
      put(
        appActions.setLoading({
          isLoading: true,
        }),
      ),
      put(
        appActions.setError({
          error: false,
        }),
      ),
    ]);
    const {username, password} = yield select(appSelectors.getAccessData);
    const serverUrl = yield select(appSelectors.getServerUrl);

    const data = yield call(appApi.auth, {
      email: username,
      password,
      serverUrl,
    });

    if (data?.user) {
      const {user} = data;
      yield put(userActions.setUser({user}));
    } else {
      throw Error(data?.message);
    }
    hasToNavigate = true;
  } catch (e) {
    yield put(
      appActions.setError({
        error: true,
      }),
    );
  } finally {
    const numberOfSurveys = yield select(
      surveysSelectors.getNumberOfLocalSurveys,
    );
    if (hasToNavigate) {
      yield call(
        navigator.navigatorDispatch,
        StackActions.replace(
          numberOfSurveys < 0 ? ROUTES.HOME : ROUTES.SURVEYS,
        ),
      );
    }

    yield put(
      appActions.setLoading({
        isLoading: false,
      }),
    );
  }
}

function* handleInitConnection({payload}) {
  yield all([
    put(appActions.setAccessData(payload)),
    put(appActions.setServerUrl(payload)),
  ]);
  yield call(handleAuthenticateUser);
}

function* handleReset() {
  yield call(cleanAllData);
}

export default function* () {
  yield takeLatest(appActionTypes.initConnection$, handleInitConnection);
  yield takeLatest(globalActions.reset, handleReset);
}
