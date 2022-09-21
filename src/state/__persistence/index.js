import {Objects} from '@openforis/arena-core';
import {call, select, put} from 'redux-saga/effects';

import {getRecordKey} from 'arena/record';
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

export function* persistRecordWithNodes({record}) {
  yield call(createSurveyFolder, record);
  yield call(fs.writeFile, {
    filePath: getRecordPath(record),
    content: JSON.stringify(record),
  });
}

export function* persistRecordWithKeyAndMergeCurrentNodes({record}) {
  const nodes = yield select(state =>
    nodesSelectors.getNodesByUuidRecordUuid(state, record.uuid),
  );
  let recordKey = yield select(state =>
    recordsSelectors.getRecordKey(state, record.uuid),
  );

  if (Objects.isEmpty(recordKey)) {
    const nodeDefRoot = yield select(surveySelectors.getNodeDefRoot);
    const nodeDefsByUuid = yield select(surveySelectors.getNodeDefsByUuid);
    recordKey = yield call(
      getRecordKey,
      Object.values(Objects.isEmpty(nodes) ? record.nodes : nodes),
      nodeDefRoot,
      nodeDefsByUuid,
    );
  }

  const _record = Object.assign(
    {},
    record,
    Objects.isEmpty(nodes) ? {} : {nodes},
    {
      recordKey,
    },
  );

  yield call(createSurveyFolder, _record);

  yield call(fs.writeFile, {
    filePath: getRecordPath(_record),
    content: JSON.stringify(_record),
  });
}

export function* persistRecordsAndNodes() {
  // maybe add a loader
  try {
    const records = yield select(surveySelectors.getRecords);
    const recordUuids = [];
    for (const record of records) {
      yield call(persistRecordWithKeyAndMergeCurrentNodes, {record});
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

export const getRecord = async record => {
  const filePath = getRecordPath(record);
  const recordContent = await fs.readfile({filePath});
  return JSON.parse(recordContent);
};

export function* getRecordWithNodes({record}) {
  const currentRecord = yield select(state =>
    recordsSelectors.getRecordByUuid(state, record.uuid),
  );

  if (currentRecord !== false && !Objects.isEmpty(currentRecord)) {
    return currentRecord;
  }

  const _record = yield call(getRecord, record);

  return _record;
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
