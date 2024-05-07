import {call, select, put, all} from 'redux-saga/effects';

import {joinRecordItems} from 'arena/record';

import validationActions from 'state/validation/actionCreators';
import {selectors as validationSelectors} from 'state/validation';
import nodesActions from 'state/nodes/actionCreators';
import nodesSelectors from 'state/nodes/selectors';
import recordsActions from 'state/records/actionCreators';
import recordsSelectors from 'state/records/selectors';
import surveySelectors from 'state/survey/selectors';

import {updateNodeAndDependants, callbackAndJump} from './methods';

function* handleUpdateNode({payload}) {
  try {
    const {updatedNode, callback, shouldJump} = payload;

    const [survey, node, record, recordNodes, validation] = yield all([
      select(surveySelectors.getSurvey),
      select(state => nodesSelectors.getNodeByUuid(state, updatedNode.uuid)),
      select(state =>
        recordsSelectors.getRecordByUuid(state, updatedNode.recordUuid),
      ),
      select(state =>
        nodesSelectors.getNodesByUuidRecordUuid(state, updatedNode.recordUuid),
      ),
      select(validationSelectors.getValidation),
    ]);

    if (!node?.uuid) {
      return;
    }

    // the record needs to be populated with the validation and records to make it works

    const fullRecord = joinRecordItems({
      record,
      nodesByUuid: recordNodes,
      validation,
    });

    const {
      nodes: updatedNodes,
      validation: updatedValidation,
      record: updatedRecord,
    } = yield call(updateNodeAndDependants, {
      node: updatedNode,
      record: fullRecord,
      survey,
    });

    delete updatedRecord.validation;
    delete updatedRecord.nodes;
    yield all([
      put(recordsActions.setRecord({record: updatedRecord})),
      put(nodesActions.setNodes({nodes: updatedNodes})),
      put(validationActions.setValidation({validation: updatedValidation})),
    ]);

    yield call(callbackAndJump, {
      currentNode: updatedNode,
      callback,
      shouldJump,
    });
  } catch (e) {
    console.log('Updatenode', e);
  }
}

export default handleUpdateNode;
