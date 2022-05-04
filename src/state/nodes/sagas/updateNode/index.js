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

  //yield call(validateIfRootWithOtherRecords);

  const {updateNodes} = yield call(updateNodeAndDependats, {
    node,
    updatedNode,
    record,
    recordNodes,
    nodeDefsByUuid,
  });
  yield put(nodesActions.setNodes({nodes: updateNodes}));
}

export default handleUpdateNode;
