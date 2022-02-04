import {all, fork} from 'redux-saga/effects'

import {sagas as app} from './app'

export default function* rootSaga() {
  yield all([fork(app)])
}
