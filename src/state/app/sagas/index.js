import {takeLatest, put, select, call, all} from 'redux-saga/effects'

import {actions as userActions} from 'state/user'

import appActionTypes from '../actionTypes'
import appActions from '../actionCreators'
import appSelectors from '../selectors'
import appApi from '../api'
import * as navigator from 'state/navigatorService'
import {ROUTES} from 'navigation/constants'

export function* handleAuthenticateUser() {
  try {
    yield put(
      appActions.setLoading({
        isLoading: true,
      }),
    )
    const {username, password} = yield select(appSelectors.getAccessData)

    const data = yield call(appApi.auth, {
      email: username,
      password,
    })

    if (data?.user) {
      const {user} = data
      yield put(userActions.setUser({user}))
    } else {
      throw Error(data?.message || 'No user')
    }
  } catch (e) {
    console.log('e', e)
  } finally {
    yield put(
      appActions.setLoading({
        isLoading: false,
      }),
    )
    yield call(navigator.reset, ROUTES.HOME)
  }
}

function* handleInitConnection({payload}) {
  yield put(appActions.setAccessData(payload))
  yield call(handleAuthenticateUser)
}

export default function* () {
  yield takeLatest(appActionTypes.initConnection$, handleInitConnection)
}
