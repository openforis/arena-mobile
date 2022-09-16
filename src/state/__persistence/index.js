import {Objects} from '@openforis/arena-core';
import {call, select, put} from 'redux-saga/effects';

import * as fs from 'infra/fs';
import nodesSelectors from 'state/nodes/selectors';
import recordsActions from 'state/records/actionCreators';
import recordsSelectors from 'state/records/selectors';
import surveySelectors from 'state/survey/selectors';

const DATA_PATH = fs.BASE_PATH_DATA;

export const getSurveyFolder = surveyUuid => `${DATA_PATH}/${surveyUuid}`;

export const getRecordsFolderPath = ({surveyUuid, cycle}) =>
  `${getSurveyFolder(surveyUuid)}/${cycle}/records`;
export const getRecordPath = record =>
  `${getRecordsFolderPath(record)}/${record.uuid}.json`;

export const createSurveyFolder = async ({surveyUuid, cycle}) =>
  fs.mkdir({dirPath: getRecordsFolderPath({surveyUuid, cycle})});

function* persistRecordWithNodes({record}) {
  yield call(createSurveyFolder, record);
  yield call(fs.writeFile, {
    filePath: getRecordPath(record),
    content: JSON.stringify(record),
  });
}

function* persistRecordAndNodes({record}) {
  const nodes = yield select(state =>
    nodesSelectors.getNodesByUuidRecordUuid(state, record.uuid),
  );
  const recordKey = yield select(state =>
    recordsSelectors.getRecordKey(state, record.uuid),
  );

  yield call(persistRecordWithNodes, {
    record: Object.assign({}, record, {nodes, recordKey}),
  });
}

export function* persistRecordsAndNodes() {
  // maybe add a loader
  try {
    const records = yield select(surveySelectors.getRecords);
    const recordUuids = [];
    for (const record of records) {
      yield call(persistRecordAndNodes, {record});
      recordUuids.push(record.uuid);
    }
    yield put(recordsActions.cleanRecords({recordUuids}));
  } catch (e) {
    yield call(console.log, e);
  } finally {
  }
}

export const getRecordsFiles = async ({surveyUuid, cycle}) => {
  const dirPath = getRecordsFolderPath({
    surveyUuid,
    cycle,
  });
  return fs.readDir({dirPath});
};

export function* getRecordWithNodes({record}) {
  const currentRecord = yield select(state =>
    recordsSelectors.getRecordByUuid(state, record.uuid),
  );

  if (currentRecord !== false && !Objects.isEmpty(currentRecord)) {
    return currentRecord;
  }
  const filePath = getRecordPath(record);
  const _recordContent = yield call(fs.readfile, {filePath});

  return JSON.parse(_recordContent);
}

export const cleanAllData = async () => fs.deleteDir(DATA_PATH);

export const cleanSurvey = async ({surveyUuid, cycle}) => {
  const surveyDir = cycle
    ? getRecordsFolderPath({surveyUuid, cycle})
    : getSurveyFolder(surveyUuid);

  return fs.deleteDir(surveyDir);
};

export const cleanRecord = async record => {
  try {
    return fs.deleteDir(getRecordPath(record));
  } catch (e) {
    console.log(e);
    return;
  }
};
