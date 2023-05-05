import {fork, takeLatest} from 'redux-saga/effects';

import formActionTypes from '../actionTypes';

import handleContinueRecord from './continueRecord';
import handleCreateEntity from './createEntity';
import handleDeleteNodeEntity from './deleteNodeEntity';
import handleImportRecords, {watchFileDownloadChannel} from './importRecords';
import handleInitializeRecord from './initializeRecord';
import handleSelectEntity from './selectEntity';
import handleSelectEntityNode from './selectEntityNode';
import handleLeaveForm from './leaveForm';

export default function* () {
  yield takeLatest(formActionTypes.leaveForm$, handleLeaveForm);
  yield takeLatest(formActionTypes.initializeRecord$, handleInitializeRecord);
  yield takeLatest(formActionTypes.continueRecord$, handleContinueRecord);

  yield takeLatest(formActionTypes.createEntity$, handleCreateEntity);
  yield takeLatest(formActionTypes.selectEntity$, handleSelectEntity);
  yield takeLatest(formActionTypes.selectEntityNode$, handleSelectEntityNode);

  yield takeLatest(formActionTypes.deleteNodeEntity$, handleDeleteNodeEntity);
  yield takeLatest(formActionTypes.importRecords$, handleImportRecords);
  yield fork(watchFileDownloadChannel);
}
