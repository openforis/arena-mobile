import {call, select, put, all} from 'redux-saga/effects';

import formActions from 'state/form/actionCreators';
import nodesActions from 'state/nodes/actionCreators';
import nodesSelectors from 'state/nodes/selectors';
import recordsActions from 'state/records/actionCreators';
import recordsSelectors from 'state/records/selectors';
import surveySelectors from 'state/survey/selectors';

import {updateNodeAndDependants} from './methods';

function* handleUpdateNode({payload}) {
  const {updatedNode, callback} = payload;

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

  if (!node?.uuid) {
    return;
  }

  const recordWithNodes = {...record, nodes: {...recordNodes}};

  const {
    updatedNodes,
    validation,
    record: updatedRecord,
  } = yield call(updateNodeAndDependants, {
    node: updatedNode,
    record: recordWithNodes,
    survey,
  });

  yield all([
    put(recordsActions.setRecord({record: updatedRecord})),
    put(nodesActions.setNodes({nodes: updatedNodes})),
    put(formActions.setValidation({validation})),
  ]);

  if (callback) {
    yield call(callback);
  }
}

export default handleUpdateNode;
