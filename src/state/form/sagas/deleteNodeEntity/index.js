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

  const parentNode = yield select(state =>
    nodesSelectors.getNodeByUuid(state, node.parentUuid),
  );
  yield put(formActions.setParentEntityNode({node: parentNode}));
}

export default handleDeleteNodeEntity;
