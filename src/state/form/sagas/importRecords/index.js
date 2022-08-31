import {Objects} from '@openforis/arena-core';
import {channel} from 'redux-saga';
import {call, select, put, delay, take} from 'redux-saga/effects';

import * as fs from 'infra/fs';
import {selectors as appSelectors} from 'state/app';
import nodesActions from 'state/nodes/actionCreators';
import recordsActions from 'state/records/actionCreators';
import recordsApi from 'state/records/api';
import surveyActions from 'state/survey/actionCreators';
import surveySelectors from 'state/survey/selectors';

const BASE_PATH = fs.BASE_PATH;
const TMP_BASE_PATH = fs.TMP_BASE_PATH;
const RECORDS_IMPORT_BASE_PATH = `${BASE_PATH}/records-import`;
const NODE_FILES_IMPORT_BASE_PATH = `${TMP_BASE_PATH}/files`;

const downloadFileChannel = channel();

export function* watchFileDownloadChannel() {
  while (true) {
    const action = yield take(downloadFileChannel);
    yield put(action);
  }
}

const handleDownloadStart = _channel => _response => {
  console.log('Download start');
};

const handleDownloadProgress = _channel => node => async response => {
  const {bytesWritten, contentLength} = response;

  const finished = contentLength === bytesWritten;

  if (finished) {
    _channel.put(
      nodesActions.setNodes({
        nodes: {
          [node.uuid]: node,
        },
      }),
    );
  }
};

function* handleImportFileNodes(params) {
  try {
    const {surveyId, recordUuid, serverUrl, node} = params;
    const fileUri = `${NODE_FILES_IMPORT_BASE_PATH}/${node?.value?.fileName}`;

    const nodeUpdated = Object.assign({}, node, {
      value: Object.assign({}, node.value, {uri: fileUri}),
    });
    yield call(recordsApi.getNodeFile, {
      serverUrl,
      surveyId,
      recordUuid,
      nodeUuid: node.uuid,
      toFile: fileUri,
      onProgress: handleDownloadProgress(downloadFileChannel)(nodeUpdated),
      onStart: handleDownloadStart(downloadFileChannel),
    });
  } catch (e) {
    console.log('Error:handleImportFileNodes', e);
  }
}

function* handleImportRecord(params) {
  const {record, surveyId, serverUrl} = params;
  yield delay(1000);
  const recordData = yield call(recordsApi.getRecord, {
    serverUrl,
    surveyId,
    recordUuid: record.uuid,
  });

  const {nodes} = recordData;
  if (Object.keys(recordData).includes('nodes')) {
    delete recordData.nodes;
  }

  if (!Objects.isEmpty(recordData)) {
    let importFiles = [];
    yield put(recordsActions.setRecord({record: recordData}));
    const nodeObj = Object.assign({}, nodes);

    Object.entries(nodes).forEach(([key, node]) => {
      if (node?.value?.fileUuid) {
        importFiles.push(
          call(handleImportFileNodes, {
            surveyId,
            recordUuid: record.uuid,
            serverUrl,
            node,
          }),
        );
        delete nodeObj[key];
      }
    });
    yield delay(100);

    yield put(nodesActions.setNodes({nodes: nodeObj}));
    for (let importFile of importFiles) {
      yield importFile;
    }
    yield delay(200);
  }
}

function* handleImportRecords() {
  yield put(surveyActions.setUploading({isUploading: true}));
  try {
    yield call(fs.deleteDir, RECORDS_IMPORT_BASE_PATH);
    yield call(fs.deleteDir, NODE_FILES_IMPORT_BASE_PATH);
    yield call(fs.mkdir, {dirPath: RECORDS_IMPORT_BASE_PATH});
    yield call(fs.mkdir, {dirPath: NODE_FILES_IMPORT_BASE_PATH});
    const surveyUuid = yield select(surveySelectors.getSelectedSurveyUuid);
    const surveyId = yield select(surveySelectors.getSelectedSurveyId);

    const serverUrl = yield select(appSelectors.getServerUrl);

    const recordsInSurvey = yield call(recordsApi.getRecords, {
      serverUrl,
      surveyId,
    });

    const importRecords = recordsInSurvey.map((record, idx) =>
      call(handleImportRecord, {record, surveyId, surveyUuid, serverUrl, idx}),
    );

    for (let importRecord of importRecords) {
      yield importRecord;
    }
  } catch (error) {
    console.log('Error:handleImportRecords', error);
  } finally {
    console.log('Finally');
    yield put(surveyActions.setUploading({isUploading: false}));
  }
}

export default handleImportRecords;
