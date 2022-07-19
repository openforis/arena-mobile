import {takeLatest} from 'redux-saga/effects';

import nodeActionTypes from '../actionTypes';

import handleCreateNodeAndDescendants from './createNodeAndDescendants';
import handleCreateNodeAndDescendantsWithValue from './createNodeAndDescendantsWithValue';
import handleRemoveNode from './removeNode';
import handleUpdateNode from './updateNode';

export default function* () {
  yield takeLatest(nodeActionTypes.updateNode$, handleUpdateNode);
  yield takeLatest(nodeActionTypes.createNode$, handleCreateNodeAndDescendants);
  yield takeLatest(
    nodeActionTypes.createNodeWithValue$,
    handleCreateNodeAndDescendantsWithValue,
  );
  yield takeLatest(nodeActionTypes.removeNode$, handleRemoveNode);
}
