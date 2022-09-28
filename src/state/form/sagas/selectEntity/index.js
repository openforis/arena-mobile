import {Objects} from '@openforis/arena-core';
import {call, select, put} from 'redux-saga/effects';

import formActions from 'state/form/actionCreators';
import formSelectors from 'state/form/selectors';

import handleCreateEntity from '../createEntity';

function* navigateToNode(payload) {
  const {node = false} = payload;
  yield put(
    formActions.setParentEntityNode({
      node,
    }),
  );
  yield put(formActions.closeEntitySelector());
}
const navigateToTheSame = navigateToNode;
const navigateToAncestor = navigateToNode;
const navigateToAncestorDescendant = navigateToNode;
const navigateToDescendant = navigateToNode;

// manage is we go below keep the node
function* handleSelectEntity({payload}) {
  const {nodeDef} = payload;

  // if we select the current entity nothing happens
  const currentEntityNode = yield select(formSelectors.getParentEntityNode);

  if (currentEntityNode.nodeDefUuid === nodeDef.uuid) {
    yield call(navigateToTheSame);
    return;
  }

  const hierarchy = yield select(formSelectors.getBreadCrumbs);
  const nodeInHierarchyWithNodeDefSelected = hierarchy.find(
    _node => _node.nodeDefUuid === nodeDef.uuid,
  );

  // we move to some direct ancestor - TODO not working always
  if (nodeInHierarchyWithNodeDefSelected) {
    yield call(navigateToAncestor, {node: nodeInHierarchyWithNodeDefSelected});
    return;
  }

  // we move to some descendant
  const currentEntityNodeDescendants = yield select(state =>
    formSelectors.getNodeDescendants(state, currentEntityNode),
  );

  const childEntityNode = (currentEntityNodeDescendants || []).find(
    nodeDescendant => nodeDescendant.nodeDefUuid === nodeDef.uuid,
  );

  // the children exists
  if (childEntityNode) {
    yield call(navigateToDescendant, {node: childEntityNode});
    return;
  }

  if (hierarchy.length > 0) {
    const ancestorsDescendants = yield select(state =>
      formSelectors.getNodeEntityDescendants(state, hierarchy[0]),
    );

    const ancestorDescentantNode = ancestorsDescendants.find(
      _node => _node.nodeDefUuid === nodeDef.uuid,
    );

    if (Objects.isEmpty(ancestorDescentantNode)) {
      yield call(handleCreateEntity, {
        payload: {nodeDef, forceCreationIfSiblingExists: false},
      });
    } else {
      yield call(navigateToAncestorDescendant, {node: ancestorDescentantNode});
      return;
    }
  }

  yield put(formActions.closeEntitySelector());
}

export default handleSelectEntity;
