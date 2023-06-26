import {call} from 'redux-saga/effects';

import handleCreateNodeAndDescendants from '../createNodeAndDescendants';
import handleUpdateNode from '../updateNode';

function* handleCreateNodeAndDescendantsWithValue({payload} = {}) {
  const {nodeDef, parentNode = null, value, callback} = payload;

  const nodes = yield call(handleCreateNodeAndDescendants, {
    payload: {
      nodeDef,
      parentNode,
    },
  });

  const updatedNodes = Object.values(nodes);

  const updatedNodeWithValue = Object.assign({}, updatedNodes[0], {value});

  yield call(handleUpdateNode, {
    payload: {
      updatedNode: updatedNodeWithValue,
      callback,
      shouldJump: false,
    },
  });
}

export default handleCreateNodeAndDescendantsWithValue;
