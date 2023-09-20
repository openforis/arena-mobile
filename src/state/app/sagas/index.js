import {StackActions} from '@react-navigation/core';
import {
  takeLatest,
  put,
  select,
  call,
  all,
  race,
  delay,
} from 'redux-saga/effects';

import {Objects} from 'infra/objectUtils';
import {ROUTES} from 'navigation/constants';
import {cleanAllData} from 'state/__persistence';
import formActions from 'state/form/actionCreators';
import globalActions from 'state/globalActions';
import * as navigator from 'state/navigatorService';
import surveyActions from 'state/survey/actionCreators';
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
      put(appActions.cleanErrors()),
    ]);
    const {username, password} = yield select(appSelectors.getAccessData);
    const serverUrl = yield select(appSelectors.getServerUrl);

    if (Objects.isEmpty(serverUrl?.trim())) {
      throw Error('Server not valid');
    }

    const {isServerValid} = yield race({
      isServerValid: call(appApi.pingServer, {serverUrl}),
      timeout: delay(15000),
    });

    if (!isServerValid) {
      throw Error('Server not valid');
    }

    const {data} = yield race({
      data: call(appApi.auth, {
        email: username,
        password,
        serverUrl,
      }),
      timeout: delay(5000),
    });

    if (data?.user) {
      const {user} = data;
      yield put(userActions.setUser({user}));
    } else {
      throw Error(data?.message);
    }
    hasToNavigate = true;
  } catch (e) {
    if (e.message === 'Server not valid') {
      yield put(
        appActions.setServerError({
          serverError: true,
        }),
      );
    } else {
      yield put(
        appActions.setCredentialsError({
          credentialsError: true,
        }),
      );
    }
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

function* handleLogout() {
  yield put(userActions.cleanUser());
  yield put(appActions.cleanAccessData());
  yield put(formActions.clean());
  yield put(surveyActions.cleanSurvey());
  yield call(navigator.navigatorDispatch, StackActions.replace(ROUTES.HOME));
}

export default function* () {
  yield takeLatest(appActionTypes.initConnection$, handleInitConnection);
  yield takeLatest(appActionTypes.logout$, handleLogout);
  yield takeLatest(globalActions.reset, handleReset);
}
