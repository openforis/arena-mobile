import {RecordUpdater} from '@openforis/arena-core';
import {select, all, put, fork, call} from 'redux-saga/effects';

import formSelectors from 'state/form/selectors';
import nodesActions from 'state/nodes/actionCreators';
import recordsActions from 'state/records/actionCreators';
import surveySelectors from 'state/survey/selectors';
import {updateValidation} from '../createNodeAndDescendants';

function* handleRemoveNode({payload}) {
  const {node} = payload;

  const [fullRecord, survey] = yield all([
    select(formSelectors.getFullRecord),
    select(surveySelectors.getSurvey),
  ]);

  const updatedResult = yield call(RecordUpdater.deleteNodes, {
    nodeUuids: [node.uuid],
    record: fullRecord,
    survey,
    sideEffects: true,
  });

  const {
    nodesDeleted,
    nodes: updatedNodes,
    record: updatedRecord,
    validation: _validation,
  } = updatedResult;

  delete updatedRecord?.validation;

  const _nodes = updatedRecord?.nodes;
  delete updatedRecord?.nodes;

  yield put(nodesActions.deleteNodes({nodes: [node]}));
  yield all([
    put(nodesActions.deleteNodes({nodes: Object.values(nodesDeleted || {})})),
    put(recordsActions.setRecord({record: updatedRecord})),
    put(nodesActions.setNodes({nodes: _nodes})),
  ]);

  yield fork(updateValidation, _validation);
}

export default handleRemoveNode;
