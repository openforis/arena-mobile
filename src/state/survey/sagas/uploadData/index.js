import {channel} from 'redux-saga';
import {put, select, call, take, delay} from 'redux-saga/effects';
import Share from 'react-native-share';
import i18n from 'i18n';
import moment from 'moment';

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

const TMP_SURVEYS_FOLDER_NAME = 'survey_zip';
const TMP_SURVEYS_BASE_PATH = `${fs.TMP_BASE_PATH}/${TMP_SURVEYS_FOLDER_NAME}`;
const RECORDS_BASE_PATH = `${TMP_SURVEYS_BASE_PATH}/records`;
const FILES_BASE_PATH = `${TMP_SURVEYS_BASE_PATH}/files`;
const TMP_DEFAULT_OUTPUT_FILE_NAME = 'survey.zip';

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

function* handlePrepareRecordsData({allRecords}) {
  try {
    const uuidsOfRecordsToUpload = [];
    yield call(fs.mkdir, {dirPath: RECORDS_BASE_PATH});
    const surveyUuid = yield select(surveySelectors.getSelectedSurveyUuid);
    const cycle = yield select(surveySelectors.getSurveyCycle);

    const recordFiles = yield call(getRecordsFiles, {surveyUuid, cycle});
    const recordsJson = [];

    for (const recordFile of recordFiles) {
      const recordUuid = recordFile.name.split('.json')[0];
      const shouldInclude =
        allRecords || (yield call(checkIfShouldUpdate, {recordUuid}));

      if (shouldInclude) {
        uuidsOfRecordsToUpload.push(recordUuid);
        recordsJson.push({uuid: recordUuid, cycle});
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
    return uuidsOfRecordsToUpload;
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    console.log('Finally:recordsData');
  }
}

function* prepareFileData(fileUuid) {
  // maybe this should be done using the internal storage, store the file summary into the same folder? maybe faster
  const file = yield select(state =>
    filesSelectors.getFileByUuid(state, fileUuid),
  );

  const fileContent = yield call(fileUtils.getFileContent, file);

  const fileToExport = {
    uuid: file.uuid,
    props: {
      ...file.meta,
      name: file.meta.fileName,
      nodeUuid: file.nodeUuid,
      recordUuid: file.recordUuid,
    },
  };

  // we must avoid sending uri and path to the backend
  delete fileToExport.props.uri;
  delete fileToExport.props.path;

  yield call(fs.writeFile, {
    filePath: `${FILES_BASE_PATH}/${file.uuid}.bin`,
    content: fileContent,
    encoding: 'base64',
  });

  return fileToExport;
}

function* handlePrepareFilesData({uuidsOfRecordsToUpload}) {
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

      if (uuidsOfRecordsToUpload.includes(recordUuid)) {
        const fileToExport = yield call(prepareFileData, fileUuid);
        filesArr.push(fileToExport);
      }
    }

    yield call(fs.writeFile, {
      filePath: `${FILES_BASE_PATH}/files.json`,
      content: JSON.stringify(filesArr, null, 2),
    });
    return filesArr.length;
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    console.log('Finally:FilesData');
  }
}

function* handlePrepareZipData({
  allRecords = false,
  outputFileName = null,
} = {}) {
  try {
    const uuidsOfRecordsToUpload = yield call(handlePrepareRecordsData, {
      allRecords,
    });
    const numberOfRecordsToUpload = uuidsOfRecordsToUpload.length;
    const numberOfFilesToUpload = yield call(handlePrepareFilesData, {
      uuidsOfRecordsToUpload,
    });

    const outputFilePath = yield call(zip, {
      source: TMP_SURVEYS_FOLDER_NAME,
      destination: outputFileName ?? TMP_DEFAULT_OUTPUT_FILE_NAME,
      base: fs.TMP_BASE_PATH,
    });
    return {numberOfRecordsToUpload, numberOfFilesToUpload, outputFilePath};
  } catch (e) {
    console.log(e);
    throw e;
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

function* handleGenerateZipData({
  allRecords = false,
  outputFileName = null,
} = {}) {
  yield call(handleGetRemoteRecordsSummary);

  yield put(formActions.clean());
  yield call(persistRecordsAndNodes);

  yield call(cleanTmpFolder);
  yield call(fs.mkdir, {dirPath: TMP_SURVEYS_BASE_PATH});

  return yield call(handlePrepareZipData, {allRecords, outputFileName});
}

function* handleUploadData() {
  // check remoteSummary first -> Download and based on the status and filter upload the corresponding records

  yield put(surveyActions.setUploading({isUploading: true}));
  try {
    const serverUrl = yield select(appSelectors.getServerUrl);
    const survey = yield select(surveySelectors.getSurvey);
    const surveyCycle = yield select(surveySelectors.getSurveyCycle);

    const surveyId = survey?.id;

    yield call(checkIfCurrentServerIsTheSurveysServer, {survey, serverUrl});

    const {numberOfRecordsToUpload, numberOfFilesToUpload} = yield call(
      handleGenerateZipData,
    );

    if (numberOfRecordsToUpload === 0) {
      yield call(handleShowToast, {
        message: i18n.t('Records:all_records_sent'),
      });
      return;
    }

    // UPLOAD DATA and track progress

    yield call(handleShowToast, {
      message: `uploading ${numberOfRecordsToUpload} records and ${numberOfFilesToUpload} files`,
    });

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
  } finally {
    console.log('Finally:upload');
    yield delay(2000);
    yield put(surveyActions.setUploading({isUploading: false}));
  }
}

export function* handleShareData({payload}) {
  const {allRecords = false} = payload;
  const surveyName = yield select(surveySelectors.getSelectedSurveyName);
  const timestamp = moment().format('yyyy-MM-DD_HH-mm-ss');
  const outputFileName = `${surveyName}_data_${timestamp}.zip`;

  const {numberOfRecordsToUpload, outputFilePath} = yield call(
    handleGenerateZipData,
    {allRecords, outputFileName},
  );
  if (numberOfRecordsToUpload === 0) {
    const message = i18n.t('Records:share_data.no_records_to_share');
    yield call(handleShowToast, {message});
    return;
  }

  const res = yield call(Share.open, {url: `file://${outputFilePath}`});
  console.log('===res', res);
}

export default handleUploadData;
