import {select, put, call} from 'redux-saga/effects';

import handleRemoveNode from 'state/nodes/sagas/removeNode';
import nodesSelectors from 'state/nodes/selectors';

import formActions from '../../actionCreators';

function* handleDeleteNodeEntity({payload} = {}) {
  const {node} = payload;

  yield call(handleRemoveNode, {
    payload: {
      node,
    },
  });

  yield put(
    formActions.setShowMultipleEntityHome({
      showMultipleEntityHome: true,
    }),
  );

  const parentNode = yield select(state =>
    nodesSelectors.getNodeByUuid(state, node.parentUuid),
  );
  yield put(
    formActions.setParentEntityNode({
      node: {uuid: parentNode.uuid, nodeDefUuid: node.nodeDefUuid},
    }),
  );
}

export default handleDeleteNodeEntity;
