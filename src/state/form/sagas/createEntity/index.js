import {call, select, put, fork, delay} from 'redux-saga/effects';
import formActions from 'state/form/actionCreators';
import formSelectors from 'state/form/selectors';
import handleCreateNodeAndDescendants from 'state/nodes/sagas/createNodeAndDescendants';

function* setParentEntityNode(newNodeEntity) {
  yield put(formActions.setParentEntityNode({node: newNodeEntity}));

  yield put(
    formActions.setShowMultipleEntityHome({
      showMultipleEntityHome: false,
    }),
  );
}
function* handleCreateEntity({payload} = {}) {
  const {nodeDef: _nodeDef = false, forceCreationIfSibilingExists = true} =
    payload;

  yield put(formActions.setLoading({isLoading: true}));
  yield delay(50);

  const hierarchy = yield select(formSelectors.getHierarchy);

  const parentEntityNode = hierarchy.find(
    _node => _node.nodeDefUuid === _nodeDef?.parentUuid,
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
    yield fork(setParentEntityNode, nodeOfThisNodeDefBelowTheCurrentEntity);
  } else {
    const nodesCreated = yield call(handleCreateNodeAndDescendants, {
      payload: {
        nodeDef: _nodeDef,
        parentNode: parentEntityNode,
      },
    });

    const newNodeEntity = Object.values(nodesCreated).find(
      node => node.nodeDefUuid === _nodeDef.uuid,
    );

    yield call(setParentEntityNode, newNodeEntity);
  }
  yield delay(50);
  yield put(formActions.setLoading({isLoading: false}));
}

export default handleCreateEntity;
