import {select, all, put} from 'redux-saga/effects';

import {actions as nodesActions} from 'state/nodes';
import nodesSelectors from 'state/nodes/selectors';

import formActions from '../../actionCreators';
import formSelectors from '../../selectors';

function* handleDeleteNodeEntity({payload} = {}) {
  const {node} = payload;
  const descendants = yield select(state =>
    formSelectors.getNodeDescendants(state, node),
  );

  const siblings = yield select(state =>
    formSelectors.getNodeSiblings(state, node),
  );

  const nodesToRemove = [node, ...(descendants || [])];
  yield all(
    nodesToRemove.map(_node => put(nodesActions.deleteNode({node: _node}))),
  );

  if (siblings?.length <= 0) {
    const parentNode = yield select(state =>
      nodesSelectors.getNodeByUuid(state, node.parentUuid),
    );
    yield put(formActions.setParentEntityNode({node: parentNode}));
  } else {
    yield put(formActions.setParentEntityNode({node: siblings[0]}));
  }
}

export default handleDeleteNodeEntity;
