import {call, select, put} from 'redux-saga/effects';

import formActions from 'state/form/actionCreators';
import formSelectors from 'state/form/selectors';
import handleCreateNodeAndDescendants from 'state/nodes/sagas/createNodeAndDescendants';

function* handleCreateEntity({payload} = {}) {
  const {nodeDef: _nodeDef = false, forceCreationIfSibilingExists = true} =
    payload;

  const hierarchy = yield select(formSelectors.getHierarchy);

  const parentEntityNode = hierarchy.find(
    _node => _node.nodeDefUuid === _nodeDef.parentUuid,
  );

  const nodeDefNodes = yield select(state =>
    formSelectors.getNodeDefNodes(state, _nodeDef),
  );
  const nodeOfThisNodeDefBelowTheCurrentEntity =
    parentEntityNode?.uuid &&
    (nodeDefNodes || []).find(
      _node => _node.parentUuid === parentEntityNode.uuid,
    );

  if (
    nodeOfThisNodeDefBelowTheCurrentEntity &&
    forceCreationIfSibilingExists === false
  ) {
    yield put(
      formActions.setParentEntityNode({
        node: nodeOfThisNodeDefBelowTheCurrentEntity,
      }),
    );
  } else {
    const nodesCreated = yield call(handleCreateNodeAndDescendants, {
      nodeDef: _nodeDef,
      parentNode: parentEntityNode,
    });

    const newNodeEntity = Object.values(nodesCreated).find(
      node => node.nodeDefUuid === _nodeDef.uuid,
    );

    yield put(formActions.setParentEntityNode({node: newNodeEntity}));
  }
}

export default handleCreateEntity;
