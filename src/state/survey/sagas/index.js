import {StackActions} from '@react-navigation/core';
import {channel} from 'redux-saga';
import {
  takeLatest,
  put,
  select,
  call,
  take,
  fork,
  delay,
} from 'redux-saga/effects';

import * as fs from 'infra/fs';
import WS, {WebSocketEvents} from 'infra/ws';
import {zip} from 'infra/zip';
import {ROUTES} from 'navigation/constants';
import appSelectors from 'state/app/selectors';
import {actions as formActions} from 'state/form';
import * as navigator from 'state/navigatorService';
import nodesSelectors from 'state/nodes/selectors';
import surveysApi from 'state/surveys/api';
import surveysSelectors from 'state/surveys/selectors';

import surveyActions from '../actionCreators';
import surveyActionTypes from '../actionTypes';
import surveySelectors from '../selectors';

const RECORDS_BASE_PATH = `${fs.TMP_BASE_PATH}/records`;

function* handleSelectSurvey({payload}) {
  try {
    const {surveyUuid} = payload;
    const survey = yield select(state =>
      surveysSelectors.getSurveyByUuid(state, surveyUuid),
    );

    if (!survey) {
      throw Error('Missing survey');
    }
    yield put(surveyActions.setSurvey({survey}));
    yield put(formActions.clean());
    yield call(navigator.navigatorDispatch, StackActions.replace(ROUTES.HOME));
  } catch (error) {
    console.log('Error', error.message);
  } finally {
    console.log('Finally');
  }
}

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
    console.log('Finally');
  }
}

function* handlePrepareZipData() {
  try {
    yield call(handlePrepareRecordsData);
    yield call(zip, {
      source: fs.TMP_BASE_PATH,
      destination: `${fs.TMP_BASE_PATH}/survey.zip`,
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

function* watchFileUploadChannel() {
  while (true) {
    const action = yield take(uploadFileChannel);
    yield put(action);
  }
}

function* watchUpdateJobChannel() {
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
    yield call(handlePrepareZipData);
    // UPLOAD DATA and track progress
    const serverUrl = yield select(appSelectors.getServerUrl);
    const surveyId = yield select(surveySelectors.getSelectedSurveyId);

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
  } finally {
    yield call(cleanTmpFolder);
    console.log('Finally');
    yield delay(2000);
    yield put(surveyActions.setUploading({isUploading: false}));
  }
}

export default function* () {
  yield takeLatest(surveyActionTypes.selectSurvey$, handleSelectSurvey);
  yield takeLatest(surveyActionTypes.uploadSurveyData$, handleUploadData);
  yield fork(watchFileUploadChannel);
  yield fork(watchUpdateJobChannel);
}
