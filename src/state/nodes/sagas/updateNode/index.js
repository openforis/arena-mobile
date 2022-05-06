import {call, select, put, all} from 'redux-saga/effects';

import nodesActions from 'state/nodes/actionCreators';
import nodesSelectors from 'state/nodes/selectors';
import recordsSelectors from 'state/records/selectors';
import surveySelectors from 'state/survey/selectors';

import {updateNodeAndDependats} from './methods';

function* handleUpdateNode({payload}) {
  const {updatedNode} = payload;

  const [node, record, recordNodes, nodeDefsByUuid] = yield all([
    select(state => nodesSelectors.getNodeByUuid(state, updatedNode.uuid)),
    select(state =>
      recordsSelectors.getRecordByUuid(state, updatedNode.recordUuid),
    ),
    select(state =>
      nodesSelectors.getNodesByRecordUuid(state, updatedNode.recordUuid),
    ),
    select(surveySelectors.getNodeDefsByUuid),
  ]);

  if (!node.uuid) {
    return;
  }

  //yield call(validateIfRootWithOtherRecords);

  const {updatedNodes, validatedNodes} = yield call(updateNodeAndDependats, {
    node,
    updatedNode,
    record,
    recordNodes,
    nodeDefsByUuid,
  });

  yield put(nodesActions.setNodes({nodes: updatedNodes}));
  yield put(nodesActions.setErrors({errors: validatedNodes}));
}

export default handleUpdateNode;
