import {call, select, put, all} from 'redux-saga/effects';

import nodesActions from 'state/nodes/actionCreators';
import nodesSelectors from 'state/nodes/selectors';
import recordsSelectors from 'state/records/selectors';
import surveySelectors from 'state/survey/selectors';

import {updateNodeAndDependats} from './methods';

function* handleUpdateNode({payload}) {
  const {updatedNode} = payload;

  const [survey, node, record, recordNodes] = yield all([
    select(surveySelectors.getSurvey),
    select(state => nodesSelectors.getNodeByUuid(state, updatedNode.uuid)),
    select(state =>
      recordsSelectors.getRecordByUuid(state, updatedNode.recordUuid),
    ),
    select(state =>
      nodesSelectors.getNodesByUuidRecordUuid(state, updatedNode.recordUuid),
    ),
  ]);

  if (!node.uuid) {
    return;
  }

  //yield call(validateIfRootWithOtherRecords);

  const recordWithNodes = {...record, nodes: {...recordNodes}};

  //const {updatedNodes, validation} = yield call(updateNodeAndDependats, {
  const {updatedNodes} = yield call(updateNodeAndDependats, {
    node: updatedNode,
    record: recordWithNodes,
    survey,
  });

  yield put(nodesActions.setNodes({nodes: updatedNodes}));
  //yield put(nodesActions.setErrors({errors: validation.errors}));
  //yield put(nodesActions.setWarnings({warnings}));
}

export default handleUpdateNode;
