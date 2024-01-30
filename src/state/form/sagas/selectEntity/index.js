import {call, select, put, all} from 'redux-saga/effects';

import {Objects} from 'infra/objectUtils';
import appSelectors from 'state/app/selectors';
import formActions from 'state/form/actionCreators';
import formSelectors from 'state/form/selectors';

import {NodeDefs} from '@openforis/arena-core';

function* closeIfTablet() {
  const isTablet = yield select(appSelectors.getIsTablet);

  if (!isTablet) {
    yield put(formActions.closeEntitySelector());
  }
}

function* navigateToNode(payload = {}) {
  const {node = false, nodeDef = false} = payload;
  if (!Objects.isEmpty(node)) {
    yield put(
      formActions.setParentEntityNode({
        node,
      }),
    );
  }
  yield put(
    formActions.setShowMultipleEntityHome({
      showMultipleEntityHome: NodeDefs.isMultiple(nodeDef),
    }),
  );
  yield call(closeIfTablet);
}

const navigateToSame = navigateToNode;
const navigateToAncestor = navigateToNode;
const navigateToAncestorDescendant = navigateToNode;
const navigateToDescendant = navigateToNode;

// manage is we go below keep the node
function* handleSelectEntity({payload}) {
  const {nodeDef} = payload;

  // if we select the current entity nothing happens
  const currentEntityNode = yield select(formSelectors.getParentEntityNode);

  if (currentEntityNode.nodeDefUuid === nodeDef.uuid) {
    yield call(navigateToSame, {node: currentEntityNode, nodeDef});
    return;
  }

  const hierarchy = yield select(formSelectors.getBreadCrumbs);
  const nodeInHierarchyWithNodeDefSelected = hierarchy.find(
    _node => _node.nodeDefUuid === nodeDef.uuid,
  );

  // we move to some direct ancestor
  if (nodeInHierarchyWithNodeDefSelected) {
    yield call(navigateToAncestor, {
      node: nodeInHierarchyWithNodeDefSelected,
      nodeDef,
    });
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
    yield call(navigateToDescendant, {node: childEntityNode, nodeDef});
    return;
  }

  if (hierarchy.length > 0) {
    const hierarchyOfAncestors = hierarchy.slice(0, -1);
    let ancestorsDescendants = yield all(
      hierarchyOfAncestors.map(hnode =>
        select(state => formSelectors.getNodeChildren(state, hnode)),
      ),
    );

    ancestorsDescendants = ancestorsDescendants.flat();

    const ancestorDescentantNode = ancestorsDescendants.find(
      _node => _node.nodeDefUuid === nodeDef.uuid,
    );

    if (Objects.isEmpty(ancestorDescentantNode)) {
      const commonParentNode = hierarchy.find(
        ancestorNode => ancestorNode.nodeDefUuid === nodeDef.parentUuid,
      );

      yield call(navigateToDescendant, {
        nodeDef,
        node: {
          uuid: commonParentNode.uuid,
          nodeDefUuid: nodeDef.uuid,
        },
      });
    } else {
      yield call(navigateToAncestorDescendant, {
        node: ancestorDescentantNode,
        nodeDef,
      });
      return;
    }
  }

  yield call(closeIfTablet);
}

export default handleSelectEntity;
