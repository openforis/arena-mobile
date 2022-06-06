import {call, select, put} from 'redux-saga/effects';

import formActions from 'state/form/actionCreators';
import formSelectors from 'state/form/selectors';

import handleCreateEntity from '../createEntity';

// manage is we go below keep the node
function* handleSelectEntity({payload}) {
  const {nodeDef} = payload;

  // if we select the current entity nothing happens
  const currentEntityNode = yield select(formSelectors.getParentEntityNode);

  if (currentEntityNode.nodeDefUuid === nodeDef.uuid) {
    yield put(formActions.closeEntitySelector());
    return;
  }

  const hierarchy = yield select(formSelectors.getBreadCrumbs);
  const nodeInHierarchyWithNodeDefSelected = hierarchy.find(
    _node => _node.nodeDefUuid === nodeDef.uuid,
  );

  // we move to some ancestor
  if (nodeInHierarchyWithNodeDefSelected) {
    yield put(
      formActions.setParentEntityNode({
        node: nodeInHierarchyWithNodeDefSelected,
      }),
    );
  } else {
    const currentEntityNodeDescendants = yield select(state =>
      formSelectors.getNodeDescendants(state, currentEntityNode),
    );

    const childEntityNode = (currentEntityNodeDescendants || []).find(
      nodeDescendant => nodeDescendant.nodeDefUuid === nodeDef.uuid,
    );

    // the children exists
    if (childEntityNode) {
      yield put(formActions.setParentEntityNode({node: childEntityNode}));
    } else {
      // the children doesnt exist we need to create
      yield call(handleCreateEntity, {
        payload: {nodeDef, forceCreationIfSibilingExists: false},
      });
    }
  }

  yield put(formActions.closeEntitySelector());
}

export default handleSelectEntity;
