import {channel} from 'redux-saga';
import {put, select, call, take, delay} from 'redux-saga/effects';

import {getLocalRecordStatus, recordStatus} from 'arena/record';
import {checkIfCurrentServerIsTheSurveysServer} from 'arena/survey';
import * as fs from 'infra/fs';
import {handleShowToast} from 'infra/toast';
import WS, {WebSocketEvents} from 'infra/ws';
import {zip} from 'infra/zip';
import {
  persistRecordsAndNodes,
  getRecordsFiles,
  getRecord,
} from 'state/__persistence';
import appSelectors from 'state/app/selectors';
import {selectors as filesSelectors, utils as fileUtils} from 'state/files';
import formActions from 'state/form/actionCreators';
import recordActions from 'state/records/actionCreators';
import handleGetRemoteRecordsSummary from 'state/records/sagas/getRemoteRecordsSummary';
import recordSelectors from 'state/records/selectors';
import surveysApi from 'state/surveys/api';

import surveyActions from '../../actionCreators';
import surveySelectors from '../../selectors';
const TMP_SURVEYS_BASE_PATH = `${fs.TMP_BASE_PATH}/survey_zip`;
const RECORDS_BASE_PATH = `${TMP_SURVEYS_BASE_PATH}/records`;
const FILES_BASE_PATH = `${TMP_SURVEYS_BASE_PATH}/files`;

function* checkIfShouldUpdate({recordUuid}) {
  // TODO when filter checking if the recordUuids is in the whitelist or whitelist is empty based on filters and seclection
  const surveyUuid = yield select(surveySelectors.getSelectedSurveyUuid);
  const cycle = yield select(surveySelectors.getSurveyCycle);
  const record = yield call(getRecord, {
    surveyUuid,
    cycle,
    uuid: recordUuid,
  });
  const recordRemoteSummary = yield select(state =>
    recordSelectors.getRemoteRecordSummary(state, recordUuid),
  );

  const status = getLocalRecordStatus({record, recordRemoteSummary});

  return status === recordStatus.new || status === recordStatus.modifiedLocally;
}

function* handlePrepareRecordsData() {
  let numberOfRecordsToUpload = 0;
  try {
    yield call(fs.mkdir, {dirPath: RECORDS_BASE_PATH});
    const surveyUuid = yield select(surveySelectors.getSelectedSurveyUuid);
    const cycle = yield select(surveySelectors.getSurveyCycle);

    const recordFiles = yield call(getRecordsFiles, {surveyUuid, cycle});
    const recordsJson = [];

    for (const recordFile of recordFiles) {
      const recordUuid = recordFile.name.split('.json')[0];
      const shouldUpdate = yield call(checkIfShouldUpdate, {recordUuid});
      if (shouldUpdate) {
        recordsJson.push({uuid: recordUuid, cycle});
        numberOfRecordsToUpload = numberOfRecordsToUpload + 1;
        yield call(fs.copyFile, {
          sourcePath: recordFile.path,
          destinationPath: `${RECORDS_BASE_PATH}/${recordUuid}.json`,
        });
      }
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
  return numberOfRecordsToUpload;
}

function* handlePrepareFilesData() {
  try {
    yield call(fs.mkdir, {dirPath: FILES_BASE_PATH});

    const surveyUuid = yield select(surveySelectors.getSelectedSurveyUuid);
    const cycle = yield select(surveySelectors.getSurveyCycle);
    const {files: surveyFiles} = yield call(fileUtils.getSurveyFiles, {
      surveyUuid,
      cycle,
    });

    const filesArr = [];

    for (const file of surveyFiles) {
      const fileObject = file
        .split('arena-data/')[1]
        .split('files/')[1]
        .split('/');

      // fileObject = [_recordUuid, _nodeUuid, fileUuid, _fileName]
      const recordUuid = fileObject[0];
      const fileUuid = fileObject[2];

      const shouldUpdate = yield call(checkIfShouldUpdate, {recordUuid});

      if (shouldUpdate) {
        // maybe this dhould be done used the internal storage, store the file summary into the same folder? maybe faster
        const _file = yield select(state =>
          filesSelectors.getFileByUuid(state, fileUuid),
        );

        const fileContent = yield call(fileUtils.getFileContent, _file);

        const fileToAppend = {
          uuid: _file.uuid,
          props: {
            ..._file.meta,
            name: _file.meta.fileName,
            nodeUuid: _file.nodeUuid,
            recordUuid: _file.recordUuid,
          },
        };

        // we must to avoid the uri to send to the backend
        delete fileToAppend.props.uri;

        filesArr.push(fileToAppend);

        yield call(fs.writeFile, {
          filePath: `${FILES_BASE_PATH}/${_file.uuid}.bin`,
          content: fileContent,
          encoding: 'base64',
        });
      }
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
  let numberOfRecordsToUpload = 0;
  try {
    numberOfRecordsToUpload = yield call(handlePrepareRecordsData);
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
  return numberOfRecordsToUpload;
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
const updateJobChannel = channel();

export function* watchFileUploadChannel() {
  while (true) {
    const action = yield take(uploadFileChannel);
    yield put(action);
  }
}

export function* watchUpdateJobChannel() {
  while (true) {
    const action = yield take(updateJobChannel);
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

  if (job.ended) {
    _channel.put(recordActions.getRemoteRecordsSummary());
  }
};

function* handleUploadData() {
  // check remoteSummary first -> Download and based on the status and filter upload the corresponding records

  yield put(surveyActions.setUploading({isUploading: true}));
  try {
    const serverUrl = yield select(appSelectors.getServerUrl);
    const survey = yield select(surveySelectors.getSurvey);
    const surveyCycle = yield select(surveySelectors.getSurveyCycle);

    const surveyId = survey?.id;

    yield call(checkIfCurrentServerIsTheSurveysServer, {survey, serverUrl});

    yield call(handleGetRemoteRecordsSummary);

    yield put(formActions.clean());
    yield call(persistRecordsAndNodes);

    yield call(cleanTmpFolder);
    yield call(fs.mkdir, {dirPath: TMP_SURVEYS_BASE_PATH});
    const numberOfRecordsToUpload = yield call(handlePrepareZipData);
    // UPLOAD DATA and track progress

    if (numberOfRecordsToUpload === 0) {
      return;
    }
    yield call(WS({serverUrl}).create);
    yield call(WS({serverUrl}).on, {
      eventName: WebSocketEvents.jobUpdate,
      handler: handleJobProgress(updateJobChannel),
    });

    yield call(surveysApi.uploadSurveyZip, {
      serverUrl,
      surveyId,
      surveyCycle,
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
