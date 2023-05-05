import {StackActions} from '@react-navigation/core';
import {call, select, put} from 'redux-saga/effects';

import formActions from 'state/form/actionCreators';
import formSelectors from 'state/form/selectors';

import {ROUTES} from 'navigation/constants';
import {persistRecordWithKeyAndMergeCurrentNodes} from 'state/__persistence';

import * as navigator from 'state/navigatorService';

function* handleLeaveForm() {
  yield put(formActions.closeEntitySelector());
  const record = yield select(formSelectors.getRecord);
  yield call(persistRecordWithKeyAndMergeCurrentNodes, {record});
  yield call(navigator.navigatorDispatch, StackActions.replace(ROUTES.RECORDS));
}

export default handleLeaveForm;
