import {StackActions} from '@react-navigation/core';
import {call, select, put} from 'redux-saga/effects';

import {ROUTES} from 'navigation/constants';
import {persistRecordWithKeyAndMergeCurrentNodes} from 'state/__persistence';
import formActions from 'state/form/actionCreators';
import formSelectors from 'state/form/selectors';
import * as navigator from 'state/navigatorService';
import recordActions from 'state/records/actionCreators';

function* handleLeaveForm() {
  yield put(formActions.closeEntitySelector());
  const record = yield select(formSelectors.getRecord);
  if (record.lastModifiedAt) {
    yield call(persistRecordWithKeyAndMergeCurrentNodes, {record});
  }
  yield call(navigator.navigatorDispatch, StackActions.replace(ROUTES.RECORDS));
  if (!record.lastModifiedAt) {
    yield put(recordActions.deleteRecord({recordUuid: record.uuid}));
    yield put(formActions.clean());
  }
}

export default handleLeaveForm;
