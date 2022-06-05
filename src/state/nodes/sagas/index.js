import {takeLatest} from 'redux-saga/effects';

import nodeActionTypes from '../actionTypes';

import handleCreateNodeAndDescendants from './createNodeAndDescendants';
import handleUpdateNode from './updateNode';

export default function* () {
  yield takeLatest(nodeActionTypes.updateNode$, handleUpdateNode);
  yield takeLatest(nodeActionTypes.createNode$, handleCreateNodeAndDescendants);
}
