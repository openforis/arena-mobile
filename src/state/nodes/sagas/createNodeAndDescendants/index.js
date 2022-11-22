import {
  Objects,
  RecordNodesUpdater,
  Records,
  RecordUpdater,
  RecordValidator,
} from '@openforis/arena-core';
import {select, all, put, call} from 'redux-saga/effects';

import formActions from 'state/form/actionCreators';
import formSelectors from 'state/form/selectors';
import nodesActions from 'state/nodes/actionCreators';
import recordsActions from 'state/records/actionCreators';
import surveySelectors from 'state/survey/selectors';

function* handleCreateNodeAndDescendants({payload} = {}) {
  const {nodeDef, parentNode} = payload;
  const [record, recordNodes, survey, validation] = yield all([
    select(formSelectors.getRecord),
    select(formSelectors.getRecordNodesByUuid),
    select(surveySelectors.getSurvey),
    select(formSelectors.getValidation),
  ]);

  const recordWithNodesAndValidation = Records.addNodes(recordNodes || {})(
    record,
  );
  const fullRecord = Object.assign({}, recordWithNodesAndValidation, {
    validation,
  });

  let updateResult = false;

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
  const {nodes: updatedNodes, record: updatedRecord} = updateResult;

  const _validation = updatedRecord.validation;
  delete updatedRecord.validation;

  yield all([
    put(recordsActions.setRecord({record: updatedRecord})),
    put(nodesActions.setNodes({nodes: updatedNodes})),
    put(formActions.setValidation({validation: _validation})),
  ]);

  return updatedNodes;
}

export default handleCreateNodeAndDescendants;
