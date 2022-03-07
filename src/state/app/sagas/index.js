import {takeLatest, put, select, call, all} from 'redux-saga/effects';

import {ROUTES} from 'navigation/constants';
import * as navigator from 'state/navigatorService';
import {actions as userActions} from 'state/user';

import appActions from '../actionCreators';
import appActionTypes from '../actionTypes';
import appApi from '../api';
import appSelectors from '../selectors';

export function* handleAuthenticateUser() {
  try {
    yield put(
      appActions.setLoading({
        isLoading: true,
      }),
    );
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
      throw Error(data?.message || 'No user');
    }
  } catch (e) {
    console.log('e', e);
  } finally {
    yield put(
      appActions.setLoading({
        isLoading: false,
      }),
    );
    yield call(navigator.reset, ROUTES.HOME);
  }
}

function* handleInitConnection({payload}) {
  yield all([
    put(appActions.setAccessData(payload)),
    put(appActions.setServerUrl(payload)),
  ]);
  yield call(handleAuthenticateUser);
}

export default function* () {
  yield takeLatest(appActionTypes.initConnection$, handleInitConnection);
}
