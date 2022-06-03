import {takeLatest} from 'redux-saga/effects';

import nodeActionTypes from '../actionTypes';

import handleCreateNode from './createNode';
import handleUpdateNode from './updateNode';

export default function* () {
  yield takeLatest(nodeActionTypes.updateNode$, handleUpdateNode);
  yield takeLatest(nodeActionTypes.createNode$, handleCreateNode);
}
