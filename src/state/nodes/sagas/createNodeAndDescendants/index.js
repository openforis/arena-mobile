import {RecordNodesUpdater} from '@openforis/arena-core';
import moment from 'moment';
import {select, all, put} from 'redux-saga/effects';

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

  const updateRecord = RecordNodesUpdater.addNodeAndDescendants({
    survey,
    record: recordWithNodes,
    parentNode,
    nodeDef,
  });

  // TODO Add surveyUuid into CORE and fix dates
  const updatedNodes = {};
  Object.keys(updateRecord.nodes).forEach(
    nodeUuid =>
      (updatedNodes[nodeUuid] = {
        refData: null,
        ...updateRecord.nodes[nodeUuid],
        surveyUuid: survey.uuid,
        dateCreated: moment().toISOString(),
        dateModified: moment().toISOString(),
      }),
  );

  yield put(nodesActions.setNodes({nodes: updatedNodes}));
  return updatedNodes;
}

export default handleCreateNodeAndDescendants;
