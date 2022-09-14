import {NodeDefType} from '@openforis/arena-core';
import {takeLatest, select, call, all, put} from 'redux-saga/effects';

import {normalizeByUuid} from 'infra/stateUtils';
import nodesActions from 'state/nodes/actionCreators';
import recordsActions from 'state/records/actionCreators';
import surveyActions from 'state/survey/actionCreators';
import surveySelectors from 'state/survey/selectors';
import surveysActions from 'state/surveys/actionCreators';

import filesActionTypes from '../actionCreators';
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

function* handleDeleteFiles(filesByFileUuid) {
  yield call(arenaFileUtils.deleteFiles, Object.values(filesByFileUuid));
  yield put(
    filesActionTypes.deleteFiles({filesUuids: Object.keys(filesByFileUuid)}),
  );
}

function* handleDeleteNodesFiles({payload}) {
  const {nodes} = payload;
  const fileNodes = yield call(filterFileNodes, nodes);

  if (Object.keys(fileNodes).length > 0) {
    const filesByFileUuid = {};
    Object.values(fileNodes).forEach(node => {
      filesByFileUuid[node?.value?.fileUuid] = {
        surveyUuid: node.surveyUuid,
        cycle: '0', // TODO when cycle
        recordUuid: node.recordUuid,
        nodeUuid: node.uuid,
        fileUuid: node?.value?.fileUuid,
      };
    });
    yield call(handleDeleteFiles, filesByFileUuid);
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

    const filesByUuid = normalizeByUuid(files);

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

export default function* () {
  yield takeLatest(nodesActions.setNodes, handleSetNodes);
  // TODO!!
  yield takeLatest(surveysActions.deleteSurvey, handleDeleteSurveyFiles);
  yield takeLatest(surveyActions.deleteSurveyData, handleDeleteSurveyFiles);
  yield takeLatest(recordsActions.deleteRecord, handleDeleteRecordFiles);
  yield takeLatest(nodesActions.deleteNodes, handleDeleteNodesFiles);
}
