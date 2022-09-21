import {Objects} from '@openforis/arena-core';
import {channel} from 'redux-saga';
import {call, select, put, delay, take} from 'redux-saga/effects';

import {checkIfCurrentServerIsTheSurveysServer} from 'arena/survey';
import * as fs from 'infra/fs';
import {handleShowToast} from 'infra/toast';
import {persistRecordWithKeyAndMergeCurrentNodes} from 'state/__persistence';
import {selectors as appSelectors} from 'state/app';
import filesActions from 'state/files/actionCreators';
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
    _channel.put(filesActions.persitFileNode({node}));
  }
};

function* handleImportFileNodes(params) {
  try {
    const {serverUrl, surveyId, recordUuid, node} = params;
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
  const {record, surveyId, serverUrl, surveyUuid} = params;
  yield delay(500);
  const recordData = yield call(recordsApi.getRecord, {
    serverUrl,
    surveyId,
    recordUuid: record.uuid,
  });

  if (!Objects.isEmpty(recordData)) {
    const importFiles = [];
    yield call(persistRecordWithKeyAndMergeCurrentNodes, {record: recordData});

    Object.entries(recordData.nodes).forEach(([_key, node]) => {
      if (node?.value?.fileUuid) {
        importFiles.push(
          call(handleImportFileNodes, {
            surveyId,
            surveyUuid,
            recordUuid: record.uuid,
            serverUrl,
            node,
          }),
        );
      }
    });

    yield call(console.log, 'number of files', importFiles.length);
    for (let importFile of importFiles) {
      yield importFile;
    }
  }
}

const prepareDirectories = async () => {
  await fs.deleteDir(RECORDS_IMPORT_BASE_PATH);
  await fs.deleteDir(NODE_FILES_IMPORT_BASE_PATH);
  await fs.mkdir({dirPath: RECORDS_IMPORT_BASE_PATH});
  await fs.mkdir({dirPath: NODE_FILES_IMPORT_BASE_PATH});
  return;
};

function* handleImportRecords() {
  yield put(surveyActions.setUploading({isUploading: true}));

  try {
    const survey = yield select(surveySelectors.getSurvey);
    const serverUrl = yield select(appSelectors.getServerUrl);
    const surveyUuid = survey?.uuid;
    const surveyId = survey?.id;

    yield call(checkIfCurrentServerIsTheSurveysServer, {survey, serverUrl});

    yield call(prepareDirectories);

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
    yield call(handleShowToast, {message: error?.message});
  } finally {
    console.log('Finally');
    yield put(surveyActions.setUploading({isUploading: false}));
  }
}

export default handleImportRecords;
