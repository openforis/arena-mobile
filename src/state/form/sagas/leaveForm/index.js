import {StackActions} from '@react-navigation/core';
import {call, select, put} from 'redux-saga/effects';

import {ROUTES} from 'navigation/constants';
import {persistRecordWithKeyAndMergeCurrentNodes} from 'state/__persistence';
import formActions from 'state/form/actionCreators';
import formSelectors from 'state/form/selectors';
import formPreferencesSelectors from 'state/form/selectors/preferences';
import * as navigator from 'state/navigatorService';
import recordActions from 'state/records/actionCreators';

export function* handleDeleteRecordIfNotModified() {
  const record = yield select(formSelectors.getRecord);
  if (!record.dateModified) {
    yield put(
      recordActions.deleteRecord({recordUuid: record.uuid, showToast: false}),
    );
    yield put(formActions.clean());
  }
}

function* handleLeaveForm() {
  yield put(formActions.closeEntitySelector());
  const hasToLockRecordsWhenLeave = yield select(
    formPreferencesSelectors.getHasToLockRecordsWhenLeave,
  );
  if (hasToLockRecordsWhenLeave) {
    const _record = yield select(formSelectors.getRecord);
    yield put(recordActions.lockRecord({recordUuid: _record.uuid}));
  }
  const record = yield select(formSelectors.getRecord);
  if (record.dateModified) {
    yield call(persistRecordWithKeyAndMergeCurrentNodes, {record});
  }
  yield call(navigator.navigatorDispatch, StackActions.replace(ROUTES.RECORDS));
}

export default handleLeaveForm;
