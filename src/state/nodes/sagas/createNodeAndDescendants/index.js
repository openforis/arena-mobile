import {RecordNodesUpdater, RecordValidator} from '@openforis/arena-core';
import {select, all, put, call} from 'redux-saga/effects';

import formActions from 'state/form/actionCreators';
import formSelectors from 'state/form/selectors';
import nodesActions from 'state/nodes/actionCreators';
import recordsActions from 'state/records/actionCreators';
import surveySelectors from 'state/survey/selectors';

function* handleCreateNodeAndDescendants({payload} = {}) {
  const {nodeDef, parentNode} = payload;
  const [record, recordNodes, survey] = yield all([
    select(formSelectors.getRecord),
    select(formSelectors.getRecordNodesByUuid),
    select(surveySelectors.getSurvey),
  ]);
  const recordWithNodes = {...record, nodes: {...(recordNodes || {})}};

  const updatedRecordAndNodes = yield call(
    RecordNodesUpdater.createNodeAndDescendants,
    {
      survey,
      record: recordWithNodes,
      parentNode,
      nodeDef,
    },
  );

  const {nodes: updatedNodes, record: updatedRecord} = updatedRecordAndNodes;

  let validation = {};
  try {
    validation = yield call(RecordValidator.validateNodes, {
      survey,
      record: updatedRecord,
      nodes: updatedNodes,
    });
  } catch (e) {
    console.log('validation error', e);
  }

  yield all([
    put(recordsActions.setRecord({record: updatedRecord})),
    put(nodesActions.setNodes({nodes: updatedNodes})),
    put(formActions.setValidation({validation})),
  ]);

  return updatedNodes;
}

export default handleCreateNodeAndDescendants;
