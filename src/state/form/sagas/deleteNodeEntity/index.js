import {select, put} from 'redux-saga/effects';

import {actions as nodesActions} from 'state/nodes';
import nodesSelectors from 'state/nodes/selectors';

import formActions from '../../actionCreators';
import formSelectors from '../../selectors';

function* handleDeleteNodeEntity({payload} = {}) {
  const {node} = payload;
  const descendants = yield select(state =>
    formSelectors.getNodeDescendants(state, node),
  );

  const nodesToRemove = [node, ...(descendants || [])];

  yield put(nodesActions.deleteNodes({nodes: nodesToRemove}));

  const parentNode = yield select(state =>
    nodesSelectors.getNodeByUuid(state, node.parentUuid),
  );
  yield put(formActions.setParentEntityNode({node: parentNode}));
}

export default handleDeleteNodeEntity;
