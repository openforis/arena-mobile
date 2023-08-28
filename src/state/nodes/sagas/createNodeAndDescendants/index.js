import {Records, RecordUpdater} from '@openforis/arena-core';
import {select, all, put, call, fork} from 'redux-saga/effects';

import {Objects} from 'infra/objectUtils';
import formActions from 'state/form/actionCreators';
import formSelectors from 'state/form/selectors';
import nodesActions from 'state/nodes/actionCreators';
import recordsActions from 'state/records/actionCreators';
import surveySelectors from 'state/survey/selectors';

function* updateValidation(validation) {
  yield put(formActions.setValidation({validation}));
}

function* handleCreateNodeAndDescendants({payload} = {}) {
  const {nodeDef, parentNode, isCreating} = payload;

  const [record, recordNodes, survey, validation] = yield all([
    select(formSelectors.getRecord),
    select(formSelectors.getRecordNodesByUuid),
    select(surveySelectors.getSurvey),
    select(formSelectors.getValidation),
  ]);

  const recordWithNodesAndValidation = Records.addNodes(recordNodes || {})(
    record,
  );
  const fullRecord = {...recordWithNodesAndValidation, validation};

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
  delete updatedRecord.nodes;

  yield all([
    put(recordsActions.setRecord({record: updatedRecord, isCreating})),
    put(nodesActions.setNodes({nodes: updatedNodes})),
  ]);

  yield fork(updateValidation, _validation);
  return updatedNodes;
}

export default handleCreateNodeAndDescendants;
