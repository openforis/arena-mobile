import {StackActions} from '@react-navigation/core';
import {call, select, put, all} from 'redux-saga/effects';

import {ROUTES} from 'navigation/constants';
import {persistRecordsAndNodes, getRecordWithNodes} from 'state/__persistence';
import formActions from 'state/form/actionCreators';
import formSelectors from 'state/form/selectors';
import * as navigator from 'state/navigatorService';
import nodesActions from 'state/nodes/actionCreators';
import recordsActions from 'state/records/actionCreators';
import surveySelectors from 'state/survey/selectors';

function* handleContinueRecord({payload}) {
  const {record} = payload;
  try {
    const currentRecordUuid = yield select(formSelectors.getRecordUuid);
    yield put(formActions.closeEntitySelector());
    if (currentRecordUuid !== record.uuid) {
      yield put(formActions.clean());
      yield call(persistRecordsAndNodes);
      const _record = yield call(getRecordWithNodes, {record});
      const nodes = {..._record.nodes};
      delete _record.nodes;
      yield all([
        put(recordsActions.setRecord({record: _record})),
        put(nodesActions.setNodes({nodes})),
      ]);

      const rootNodeDef = yield select(surveySelectors.getNodeDefRoot);

      const rootNode = yield select(state =>
        formSelectors.getNodeDefNodes(state, rootNodeDef),
      );
      yield put(formActions.setParentEntityNode({node: rootNode[0]}));
    }

    yield call(navigator.navigatorDispatch, StackActions.replace(ROUTES.FORM));
  } catch (error) {
    console.log('Error', error);
  } finally {
    console.log('Finally');
  }
}

export default handleContinueRecord;
