import {RecordNodesUpdater, RecordValidator} from '@openforis/arena-core';
import {select, all, put, call} from 'redux-saga/effects';

import formActions from 'state/form/actionCreators';
import formSelectors from 'state/form/selectors';
import {actions as nodesActions} from 'state/nodes';
import surveySelectors from 'state/survey/selectors';

function* handleCreateNodeAndDescendants({nodeDef, parentNode}) {
  const [record, recordNodes, survey] = yield all([
    select(formSelectors.getRecord),
    select(formSelectors.getRecordNodes),
    select(surveySelectors.getSurvey),
  ]);
  const recordWithNodes = {...record, nodes: {...(recordNodes || {})}};

  const updateRecord = yield call(RecordNodesUpdater.createNodeAndDescendants, {
    survey,
    record: recordWithNodes,
    parentNode,
    nodeDef,
  });

  const {nodes: updatedNodes} = updateRecord;

  const validation = yield call(RecordValidator.validateNodes, {
    survey,
    record: updateRecord.record,
    nodes: updatedNodes,
  });

  yield all([
    put(nodesActions.setNodes({nodes: updatedNodes})),
    put(formActions.setValidation({validation})),
  ]);

  return updatedNodes;
}

export default handleCreateNodeAndDescendants;
