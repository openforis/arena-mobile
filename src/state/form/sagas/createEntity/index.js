import {call, select, put} from 'redux-saga/effects';

import formActions from 'state/form/actionCreators';
import formSelectors from 'state/form/selectors';
import handleCreateNode from 'state/nodes/sagas/createNode';

function* handleCreateEntity({payload} = {}) {
  const {nodeDef: _nodeDef = false, forceCreationIfSibilingExists = true} =
    payload;

  const hierarchy = yield select(formSelectors.getHierarchy);
  const nodeDef = _nodeDef
    ? _nodeDef
    : yield select(formSelectors.getParentEntityNodeDef);

  const parentNodeInHierarchy = hierarchy.find(
    _node => _node.nodeDefUuid === nodeDef.parentUuid,
  );

  const nodeDefNodes = yield select(state =>
    formSelectors.getNodeDefNodes(state, nodeDef),
  );
  const existingNodeOfThisNodeDefBelowThisParent =
    parentNodeInHierarchy?.uuid &&
    (nodeDefNodes || []).find(
      _node => _node.parentUuid === parentNodeInHierarchy.uuid,
    );

  if (
    existingNodeOfThisNodeDefBelowThisParent &&
    forceCreationIfSibilingExists === false
  ) {
    yield put(
      formActions.setParentEntityNode({
        node: existingNodeOfThisNodeDefBelowThisParent,
      }),
    );
  } else {
    const parentNode = yield select(formSelectors.getEntityNode);
    const node = yield call(handleCreateNode, {
      nodeDef,
      parentNode: parentNodeInHierarchy || parentNode,
    });

    yield put(formActions.setParentEntityNode({node: node}));
  }
}

export default handleCreateEntity;
