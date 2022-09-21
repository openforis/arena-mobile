import {takeLatest} from 'redux-saga/effects';

import recordsActionTypes from '../actionTypes';

import handleDeleteRecord from './deleteRecord';

export default function* () {
  yield takeLatest(recordsActionTypes.deleteRecord$, handleDeleteRecord);
}
