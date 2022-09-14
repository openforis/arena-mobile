import {channel} from 'redux-saga';
import {put, select, call, take, delay} from 'redux-saga/effects';

import {checkIfCurrentServerIsTheSurveysServer} from 'arena/survey';
import * as fs from 'infra/fs';
import {handleShowToast} from 'infra/toast';
import WS, {WebSocketEvents} from 'infra/ws';
import {zip} from 'infra/zip';
import appSelectors from 'state/app/selectors';
import {selectors as filesSelectors, utils as fileUtils} from 'state/files';
import nodesSelectors from 'state/nodes/selectors';
import surveysApi from 'state/surveys/api';

import surveyActions from '../../actionCreators';
import surveySelectors from '../../selectors';

const TMP_SURVEYS_BASE_PATH = `${fs.TMP_BASE_PATH}/survey_zip`;
const RECORDS_BASE_PATH = `${TMP_SURVEYS_BASE_PATH}/records`;
const FILES_BASE_PATH = `${TMP_SURVEYS_BASE_PATH}/files`;

function* handlePrepareRecordsData() {
  try {
    yield call(fs.mkdir, {dirPath: RECORDS_BASE_PATH});
    const records = yield select(surveySelectors.getRecords);
    const recordsJson = [];

    for (const record of records) {
      const nodesInRecord = yield select(state =>
        nodesSelectors.getNodesByUuidRecordUuid(state, record.uuid),
      );

      recordsJson.push({uuid: record.uuid, cycle: record.cycle});

      yield call(fs.writeFile, {
        filePath: `${RECORDS_BASE_PATH}/${record.uuid}.json`,
        content: JSON.stringify(
          Object.assign({}, record, {nodes: nodesInRecord}),
          null,
          2,
        ),
      });
    }

    yield call(fs.writeFile, {
      filePath: `${RECORDS_BASE_PATH}/records.json`,
      content: JSON.stringify(recordsJson, null, 2),
    });
  } catch (e) {
    console.log(e);
  } finally {
    console.log('Finally:recordsData');
  }
}

function* handlePrepareFilesData() {
  try {
    yield call(fs.mkdir, {dirPath: FILES_BASE_PATH});
    const surveyUuid = yield select(surveySelectors.getSelectedSurveyUuid);
    const files = yield select(state =>
      filesSelectors.getFilesBySurveyUuid(state, surveyUuid),
    );

    const filesArr = [];
    for (const file of files) {
      const fileContent = yield call(fileUtils.getFileContent, file);

      filesArr.push(
        Object.assign(
          {},
          {
            uuid: file.uuid,
            props: {
              ...file.meta,
              name: file.meta.fileName,
              nodeUuid: file.nodeUuid,
              recordUuid: file.recordUuid,
            },
          },
        ),
      );

      yield call(fs.writeFile, {
        filePath: `${FILES_BASE_PATH}/${file.uuid}.bin`,
        content: fileContent,
        encoding: 'base64',
      });
    }

    yield call(fs.writeFile, {
      filePath: `${FILES_BASE_PATH}/files.json`,
      content: JSON.stringify(filesArr, null, 2),
    });
  } catch (e) {
    console.log(e);
  } finally {
    console.log('Finally:FilesData');
  }
}

function* handlePrepareZipData() {
  try {
    yield call(handlePrepareRecordsData);
    yield call(handlePrepareFilesData);

    yield call(zip, {
      source: 'survey_zip',
      destination: 'survey.zip',
      base: fs.TMP_BASE_PATH,
      baseOutput: fs.TMP_BASE_PATH,
    });
  } catch (e) {
    console.log(e);
  } finally {
    console.log('Finally');
  }
}

function* cleanTmpFolder() {
  try {
    yield call(fs.deleteDir, fs.TMP_BASE_PATH);
  } catch (e) {
    console.log(e);
  } finally {
    console.log('Finally');
  }
}

const uploadFileChannel = channel();
const upadteJobChannel = channel();

export function* watchFileUploadChannel() {
  while (true) {
    const action = yield take(uploadFileChannel);
    yield put(action);
  }
}

export function* watchUpdateJobChannel() {
  while (true) {
    const action = yield take(upadteJobChannel);
    yield put(action);
  }
}

const handleUploadStart = _channel => response => {
  _channel.put(surveyActions.setUploading({isUploading: true}));
};
const handleOnProgress = _channel => response => {
  const {totalBytesSent, totalBytesExpectedToSend} = response;

  const percentage = Math.floor(
    (100 * totalBytesSent) / totalBytesExpectedToSend,
  );

  _channel.put(surveyActions.setUploadProgress({uploadProgress: percentage}));
};
const handleJobProgress = _channel => job => {
  _channel.put(surveyActions.updateJob({job}));
};

function* handleUploadData() {
  yield put(surveyActions.setUploading({isUploading: true}));
  try {
    const serverUrl = yield select(appSelectors.getServerUrl);
    const survey = yield select(surveySelectors.getSurvey);

    const surveyId = survey?.id;

    yield call(checkIfCurrentServerIsTheSurveysServer, {survey, serverUrl});

    yield call(cleanTmpFolder);
    yield call(fs.mkdir, {dirPath: TMP_SURVEYS_BASE_PATH});
    yield call(handlePrepareZipData);
    // UPLOAD DATA and track progress

    yield call(WS({serverUrl}).create);
    yield call(WS({serverUrl}).on, {
      eventName: WebSocketEvents.jobUpdate,
      handler: handleJobProgress(upadteJobChannel),
    });

    yield call(surveysApi.uploadSurveyZip, {
      serverUrl,
      surveyId,
      onStart: handleUploadStart(uploadFileChannel),
      onProgress: handleOnProgress(uploadFileChannel),
    });
  } catch (e) {
    console.log(e);
    yield call(handleShowToast, {message: e?.message});
  } finally {
    console.log('Finally:upload');
    yield delay(2000);
    yield put(surveyActions.setUploading({isUploading: false}));
  }
}

export default handleUploadData;
