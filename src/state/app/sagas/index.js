import {takeLatest, put, call, all} from 'redux-saga/effects'

import appActionTypes from '../actionTypes'
import appActions from '../actionCreators'

export function* handleAuthenticateUser() {
  yield put(
    appActions.setLoading({
      isLoading: true,
    }),
  )
  // TO DO
  // get data
  // fetch api
  // handle Error
  // navigate to home
}

function* handleInitConnection({payload}) {
  yield all([
    put(appActions.setAccessData(payload)),
    put(appActions.setServerUrl(payload)),
  ])
  yield call(handleAuthenticateUser)
}

export default function* () {
  yield takeLatest(appActionTypes.initConnection$, handleInitConnection)
}
