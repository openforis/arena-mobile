import {takeLatest} from 'redux-saga/effects';

import recordsActionTypes from '../actionTypes';

import handleDeleteRecord from './deleteRecord';
import handleGetRemoteRecordsSummary from './getRemoteRecordsSummary';

export default function* () {
  yield takeLatest(recordsActionTypes.deleteRecord$, handleDeleteRecord);
  yield takeLatest(
    recordsActionTypes.getRemoteRecordsSummary$,
    handleGetRemoteRecordsSummary,
  );
}
