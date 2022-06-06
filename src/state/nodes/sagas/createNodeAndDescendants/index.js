import {RecordNodesUpdater} from '@openforis/arena-core';
import {select, all, put, call} from 'redux-saga/effects';

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

  const updateRecord = yield call(RecordNodesUpdater.addNodeAndDescendants, {
    survey,
    record: recordWithNodes,
    parentNode,
    nodeDef,
  });

  yield put(nodesActions.setNodes({nodes: updateRecord.nodes}));
  return updateRecord.nodes;
}

export default handleCreateNodeAndDescendants;
