import {StackActions} from '@react-navigation/core';
import {takeLatest, put, select, call} from 'redux-saga/effects';

import * as fs from 'infra/fs';
import {ROUTES} from 'navigation/constants';
import {actions as formActions} from 'state/form';
import * as navigator from 'state/navigatorService';
import nodesSelectors from 'state/nodes/selectors';
import surveysSelectors from 'state/surveys/selectors';

import surveyActions from '../actionCreators';
import surveyActionTypes from '../actionTypes';
import surveySelectors from '../selectors';

const BASE_PATH = 'tmp/records';

function* handleSelectSurvey({payload}) {
  try {
    const {surveyUuid} = payload;
    const survey = yield select(state =>
      surveysSelectors.getSurveyByUuid(state, {surveyUuid}),
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

function* handlePrepareData() {
  try {
    yield call(fs.mkdir, {dirPath: BASE_PATH});
    const records = yield select(surveySelectors.getRecords);
    const recordsJson = [];

    for (const record of records) {
      const nodesInRecord = yield select(state =>
        nodesSelectors.getNodesByUuidRecordUuid(state, record.uuid),
      );

      recordsJson.push({uuid: record.uuid, cycle: record.cycle});

      yield call(fs.writeFile, {
        filePath: `${BASE_PATH}/${record.uuid}.json`,
        content: JSON.stringify(
          Object.assign({}, record, {nodes: nodesInRecord}),
          null,
          2,
        ),
      });
    }

    yield call(fs.writeFile, {
      filePath: `${BASE_PATH}/records.json`,
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
    yield call(handlePrepareData);
  } catch (e) {
    console.log(e);
  } finally {
    console.log('Finally');
  }
}

function* cleanTmpFolder() {
  try {
    yield call(fs.deleteDir, BASE_PATH);
  } catch (e) {
    console.log(e);
  } finally {
    console.log('Finally');
  }
}

function* handleUploadData() {
  try {
    yield call(cleanTmpFolder);
    yield call(handlePrepareZipData);
  } catch (e) {
    console.log(e);
  } finally {
    yield call(cleanTmpFolder);
    console.log('Finally');
  }
}

export default function* () {
  yield takeLatest(surveyActionTypes.selectSurvey$, handleSelectSurvey);
  yield takeLatest(surveyActionTypes.uploadSurveyData$, handleUploadData);
}
