import {takeLatest} from 'redux-saga/effects';

import nodeActionTypes from '../actionTypes';

import handleUpdateNode from './updateNode';

export default function* () {
  yield takeLatest(nodeActionTypes.updateNode$, handleUpdateNode);
}
