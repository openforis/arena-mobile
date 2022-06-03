import {takeLatest} from 'redux-saga/effects';

import formActionTypes from '../actionTypes';

import handleInitializeRecord from './initializeRecord';

export default function* () {
  yield takeLatest(formActionTypes.initializeRecord$, handleInitializeRecord);
}
