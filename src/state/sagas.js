import {all, fork} from 'redux-saga/effects';

import {sagas as app} from './app';
import {sagas as nodes} from './nodes';
import {sagas as records} from './records';
import {sagas as survey} from './survey';
import {sagas as surveys} from './surveys';

export default function* rootSaga() {
  yield all([fork(app)]);
  yield all([fork(surveys)]);
  yield all([fork(survey)]);
  yield all([fork(records)]);
  yield all([fork(nodes)]);
}
