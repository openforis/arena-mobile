import {channel} from 'redux-saga';
import {put, select, call, take, delay} from 'redux-saga/effects';

import {checkIfCurrentServerIsTheSurveysServer} from 'arena/survey';
import * as fs from 'infra/fs';
import {handleShowToast} from 'infra/toast';
import WS, {WebSocketEvents} from 'infra/ws';
import {zip} from 'infra/zip';
import {persistRecordsAndNodes, getRecordsFiles} from 'state/__persistence';
import appSelectors from 'state/app/selectors';
import {selectors as filesSelectors, utils as fileUtils} from 'state/files';
import formActions from 'state/form/actionCreators';
import surveysApi from 'state/surveys/api';

import surveyActions from '../../actionCreators';
import surveySelectors from '../../selectors';

const TMP_SURVEYS_BASE_PATH = `${fs.TMP_BASE_PATH}/survey_zip`;
const RECORDS_BASE_PATH = `${TMP_SURVEYS_BASE_PATH}/records`;
const FILES_BASE_PATH = `${TMP_SURVEYS_BASE_PATH}/files`;

function* handlePrepareRecordsData() {
  try {
    yield call(fs.mkdir, {dirPath: RECORDS_BASE_PATH});
    const surveyUuid = yield select(surveySelectors.getSelectedSurveyUuid);
    const cycle = yield select(surveySelectors.getSurveyCycle);

    const recordFiles = yield call(getRecordsFiles, {surveyUuid, cycle});
    const recordsJson = [];

    for (const recordFile of recordFiles) {
      const recordUuid = recordFile.name.split('.json')[0];
      recordsJson.push({uuid: recordUuid, cycle});
      yield call(fs.copyFile, {
        sourcePath: recordFile.path,
        destinationPath: `${RECORDS_BASE_PATH}/${recordUuid}.json`,
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

    // get files paths getFilesFolderPath
    //copy file and prepare filesArr -> for that getFile
    const surveyUuid = yield select(surveySelectors.getSelectedSurveyUuid);
    const cycle = yield select(surveySelectors.getSurveyCycle);
    const {files: surveyFiles} = yield call(fileUtils.getSurveyFiles, {
      surveyUuid,
      cycle,
    });

    const filesArr = [];

    for (const file of surveyFiles) {
      const [_recordUuid, _nodeUuid, fileUuid, _fileName] = file
        .split('files/')[1]
        .split('/');

      // maybe this dhould be done used the internal storage, store the file summary into the same folder? maybe faster
      const _file = yield select(state =>
        filesSelectors.getFileByUuid(state, fileUuid),
      );

      const fileContent = yield call(fileUtils.getFileContent, _file);
      fileUtils.getFilesFolderPath;
      filesArr.push(
        Object.assign(
          {},
          {
            uuid: _file.uuid,
            props: {
              ..._file.meta,
              name: _file.meta.fileName,
              nodeUuid: _file.nodeUuid,
              recordUuid: _file.recordUuid,
            },
          },
        ),
      );

      yield call(fs.writeFile, {
        filePath: `${FILES_BASE_PATH}/${_file.uuid}.bin`,
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

    yield put(formActions.clean());
    yield call(persistRecordsAndNodes);

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
