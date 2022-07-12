import {Records} from '@openforis/arena-core';
import {select, all, put} from 'redux-saga/effects';

import formSelectors from 'state/form/selectors';
import nodesActions from 'state/nodes/actionCreators';
import recordsActions from 'state/records/actionCreators';

function* handleRemoveNode({payload}) {
  const {node} = payload;
  const [record, recordNodesByUuid] = yield all([
    select(formSelectors.getRecord),
    select(formSelectors.getRecordNodesByUuid),
  ]);
  const recordWithNodes = {...record, nodes: {...(recordNodesByUuid || {})}};

  const recordUpdated = Records.removeNode(node)(recordWithNodes);

  let nodesToDelete = [];
  const newRecordsUuids = Object.keys(recordUpdated.nodes);
  Object.keys(recordNodesByUuid).map(nodeUuid => {
    if (!newRecordsUuids.includes(nodeUuid)) {
      nodesToDelete.push(recordNodesByUuid[nodeUuid]);
    }
  });

  yield all([
    put(recordsActions.setRecord({record: recordUpdated})),
    put(nodesActions.deleteNodes({nodes: nodesToDelete})),
    //  -_0_- DONT remove the comment of the line bellow:  It re-renders all the nodes
    //    |  ( It is suppused to be needed by arena-core, There "h", a cache inside of the one with its hierarchy is stored inside of each node. -_0_-)
    //   / \
    //put(nodesActions.setNodes({nodes: Object.values(recordUpdated.nodes)}))
  ]);
}

export default handleRemoveNode;
