import {Objects, Records, RecordUpdater} from '@openforis/arena-core';
import {select, all, put, call} from 'redux-saga/effects';

import {perfState} from 'infra/stateUtils';
import formActions from 'state/form/actionCreators';
import formSelectors from 'state/form/selectors';
import nodesActions from 'state/nodes/actionCreators';
import recordsActions from 'state/records/actionCreators';
import surveySelectors from 'state/survey/selectors';

function* handleCreateNodeAndDescendants({payload} = {}) {
  yield call(perfState.start, 'handleCreateNodeAndDescendants');
  yield call(perfState.start, 'handleCreateNodeAndDescendants_GETTERS');

  const {nodeDef, parentNode} = payload;
  const [record, recordNodes, survey, validation] = yield all([
    select(formSelectors.getRecord),
    select(formSelectors.getRecordNodesByUuid),
    select(surveySelectors.getSurvey),
    select(formSelectors.getValidation),
  ]);
  yield call(perfState.end, 'handleCreateNodeAndDescendants_GETTERS');

  yield call(perfState.start, 'handleCreateNodeAndDescendants_ADD_NODES');

  const recordWithNodesAndValidation = Records.addNodes(recordNodes || {})(
    record,
  );

  yield call(perfState.end, 'handleCreateNodeAndDescendants_ADD_NODES');
  yield call(perfState.start, 'handleCreateNodeAndDescendants_COPY_RECORD');
  const fullRecord = Object.assign({}, recordWithNodesAndValidation, {
    validation,
  });
  yield call(perfState.end, 'handleCreateNodeAndDescendants_COPY_RECORD');

  let updateResult = false;

  yield call(perfState.start, 'handleCreateNodeAndDescendants_CORE');
  if (Objects.isEmpty(parentNode)) {
    updateResult = yield call(RecordUpdater.createRootEntity, {
      survey,
      record: fullRecord,
    });
  } else {
    updateResult = yield call(
      RecordUpdater.createNodeAndDescendants,

      {
        survey,
        record: fullRecord,
        parentNode,
        nodeDef,
      },
    );
  }
  yield call(perfState.end, 'handleCreateNodeAndDescendants_CORE');

  const {nodes: updatedNodes, record: updatedRecord} = updateResult;

  yield call(perfState.start, 'handleCreateNodeAndDescendants_VALIDATION');
  const _validation = updatedRecord.validation;
  delete updatedRecord.validation;
  yield call(perfState.end, 'handleCreateNodeAndDescendants_VALIDATION');
  yield call(perfState.start, 'handleCreateNodeAndDescendants_SETTERS');
  yield all([
    put(recordsActions.setRecord({record: updatedRecord})),
    put(nodesActions.setNodes({nodes: updatedNodes})),
    put(formActions.setValidation({validation: _validation})),
  ]);

  yield call(perfState.end, 'handleCreateNodeAndDescendants_SETTERS');
  yield call(perfState.end, 'handleCreateNodeAndDescendants');
  return updatedNodes;
}

export default handleCreateNodeAndDescendants;
