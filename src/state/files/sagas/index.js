import {NodeDefType} from '@openforis/arena-core';
import {takeLatest, select, call, all, put} from 'redux-saga/effects';

import globalActions from 'state/globalActions';
import nodesActions from 'state/nodes/actionCreators';
import recordsActions from 'state/records/actionCreators';
import surveyActions from 'state/survey/actionCreators';
import surveySelectors from 'state/survey/selectors';
import surveysActions from 'state/surveys/actionCreators';

import filesActionTypes from '../actionTypes';
import filesSelectors from '../selectors';
import arenaFileUtils from '../utils';

function* filterFileNodes(nodes) {
  const nodeDefsByUuid = yield select(surveySelectors.getNodeDefsByUuid);
  return Object.fromEntries(
    Object.entries(nodes).filter(
      ([_, node]) => nodeDefsByUuid[node.nodeDefUuid].type === NodeDefType.file,
    ),
  );
}

function* handleDeleteFiles(filesUuids) {
  yield call(arenaFileUtils.deleteFiles, filesUuids);
  yield put(filesActionTypes.deleteFiles({filesUuids}));
}

function* handleDeleteNodesFiles({payload}) {
  const {nodes} = payload;
  const fileNodes = yield call(filterFileNodes, nodes);

  if (Object.keys(fileNodes).length > 0) {
    const filesUuids = Object.values(fileNodes).map(
      node => node?.value?.fileUuid,
    );
    yield call(handleDeleteFiles, filesUuids);
  }
}

function* handleSetNodes({payload}) {
  const {nodes} = payload;
  const fileNodes = yield call(filterFileNodes, nodes);

  if (Object.keys(fileNodes).length > 0) {
    const fileNodesToCreate = Object.values(fileNodes).filter(
      node => node?.value?.uri,
    );

    const files = yield all(
      fileNodesToCreate.map(node => call(arenaFileUtils.createFile, node)),
    );

    const filesByUuid = files.reduce(
      (acc, file) => Object.assign(acc, {[file.uuid]: Object.assign({}, file)}),
      {},
    );
    yield put(filesActionTypes.setFiles({filesByUuid}));
  }
}

function* handleDeleteSurveyFiles({payload}) {
  const {surveyUuid} = payload;
  const filesBySurvey = yield select(state =>
    filesSelectors.getFilesByUuidSurveyUuid(state, surveyUuid),
  );

  yield call(handleDeleteFiles, Object.keys(filesBySurvey));
}

function* handleDeleteRecordFiles({payload}) {
  const {recordUuid} = payload;
  const filesBySurvey = yield select(state =>
    filesSelectors.getFilesByRecordUuid(state, recordUuid),
  );

  yield call(handleDeleteFiles, Object.keys(filesBySurvey));
}

function* handleDeleteAllFiles() {
  yield call(arenaFileUtils.deleteArenaFilesDir);
  yield put(filesActionTypes.reset());
}

export default function* () {
  yield takeLatest(nodesActions.setNodes, handleSetNodes);
  yield takeLatest(globalActions.reset, handleDeleteAllFiles);
  yield takeLatest(surveysActions.deleteSurvey, handleDeleteSurveyFiles);
  yield takeLatest(surveyActions.deleteSurveyData, handleDeleteSurveyFiles);
  yield takeLatest(recordsActions.deleteRecord, handleDeleteRecordFiles);
  yield takeLatest(nodesActions.deleteNodes, handleDeleteNodesFiles);
}
