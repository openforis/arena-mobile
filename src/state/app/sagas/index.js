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
import analytics from 'analytics';

function* handleAuthenticateUser() {
  let hasToNavigate = false;

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
  yield call(analytics.methods.track, analytics.events.auth.start({serverUrl}));

  try {
    if (Objects.isEmpty(serverUrl?.trim())) {
      throw Error('Server not valid');
    }

    const {isServerValid, timeout} = yield race({
      isServerValid: call(appApi.pingServer, {serverUrl}),
      timeout: delay(5000),
    });

    if (!isServerValid) {
      throw Error('Server not valid');
    }
    if (timeout) {
      throw Error('Server timeout');
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
    yield call(
      analytics.methods.track,
      analytics.events.auth.success({
        serverUrl,
        username,
      }),
    );

    yield call(analytics.methods.identify, data?.user?.uuid, {
      email: username,
      username,
    });
  } catch (e) {
    let errorType = 'credentials';
    if (e.message === 'Server not valid') {
      errorType = 'server';
    }
    if (e.message === 'Server timeout') {
      errorType = 'timeout';
    }

    yield call(
      analytics.methods.track,
      analytics.events.auth.error({
        errorMessage: e.message,
        errorType: errorType,
        serverError: e.message === 'Server not valid',
        serverTimeout: e.message === 'Server timeout',
        credentialsError:
          e.message !== 'Server not valid' || e.message !== 'Server timeout',
        serverUrl,
        username,
        password,
      }),
    );

    if (e.message === 'Server not valid' || e.message === 'Server timeout') {
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
    yield put(
      appActions.setLoading({
        isLoading: false,
      }),
    );

    if (hasToNavigate) {
      const numberOfSurveys = yield select(
        surveysSelectors.getNumberOfLocalSurveys,
      );
      yield call(
        navigator.navigatorDispatch,
        StackActions.replace(
          numberOfSurveys < 0 ? ROUTES.HOME : ROUTES.SURVEYS,
        ),
      );
    }
  }
}

function* handleInitConnection({payload}) {
  yield call(
    analytics.methods.track,
    analytics.events.connectionSettings.start(payload),
  );
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
