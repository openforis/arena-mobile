import {RecordUpdater} from '@openforis/arena-core';
import {select, all, put, call, fork} from 'redux-saga/effects';

import {Objects} from 'infra/objectUtils';
import formActions from 'state/form/actionCreators';
import validationActions from 'state/validation/actionCreators';
import formSelectors from 'state/form/selectors';
import nodesActions from 'state/nodes/actionCreators';
import recordsActions from 'state/records/actionCreators';
import surveySelectors from 'state/survey/selectors';

export function* updateValidation(validation) {
  yield put(validationActions.setValidation({validation}));
}

function* handleCreateNodeAndDescendants({payload} = {}) {
  const {nodeDef, parentNode, isCreating, selectNode} = payload;

  const [fullRecord, survey] = yield all([
    select(formSelectors.getFullRecord),
    select(surveySelectors.getSurvey),
  ]);

  let updateResult = false;

  if (Objects.isEmpty(parentNode)) {
    updateResult = yield call(RecordUpdater.createRootEntity, {
      survey,
      record: fullRecord,
    });
  } else {
    updateResult = yield call(RecordUpdater.createNodeAndDescendants, {
      survey,
      record: fullRecord,
      parentNode,
      nodeDef,
    });
  }
  const {nodes: updatedNodes, record: updatedRecord} = updateResult;

  const _validation = updatedRecord.validation;
  delete updatedRecord.validation;
  delete updatedRecord.nodes;

  yield all([
    put(recordsActions.setRecord({record: updatedRecord, isCreating})),
    put(nodesActions.setNodes({nodes: updatedNodes})),
  ]);

  yield fork(updateValidation, _validation);

  if (selectNode) {
    const nodes = Object.values(updatedNodes);
    if (nodes.length >= 1) {
      yield put(formActions.setNode({node: nodes[0]}));
    }
  }
  return updatedNodes;
}

export default handleCreateNodeAndDescendants;
