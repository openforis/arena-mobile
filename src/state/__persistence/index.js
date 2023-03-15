import {Objects} from '@openforis/arena-core';
import {call, select, put, fork} from 'redux-saga/effects';

import {getRecordKey, getRecordSummary} from 'arena/record';
import * as fs from 'infra/fs';
import {perfState} from 'infra/stateUtils';
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

export const getRecordsSummaryPath = record =>
  `${getRecordsFolderPath(record)}/records-summary.json`;

export const createSurveyFolder = async ({surveyUuid, cycle}) =>
  fs.mkdir({dirPath: getRecordsFolderPath({surveyUuid, cycle})});

export const persistRecordsSummary = async ({summary, surveyUuid, cycle}) =>
  fs.writeFile({
    filePath: getRecordsSummaryPath({surveyUuid, cycle}),
    content: `${Object.values(summary)
      .map(s => JSON.stringify(s))
      .join('\n')}\n`,
  });

export const persistRecordSummary = async ({summary}) =>
  fs.appendFile({
    filePath: getRecordsSummaryPath(summary),
    content: `${JSON.stringify(summary)}\n`,
  });

export function* _writeFile(content) {
  yield fork(fs.writeFile, content);
}

export function* persistRecordWithNodes({record}) {
  const content = {
    filePath: getRecordPath(record),
    content: JSON.stringify(record),
  };

  yield fork(_writeFile, content);

  const summary = getRecordSummary(record);

  yield call(persistRecordSummary, {summary});
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
    const categoryItemIndex = yield select(
      surveySelectors.getCategoryItemIndex,
    );
    recordKey = yield call(
      getRecordKey,
      Object.values(Objects.isEmpty(nodes) ? record.nodes || [] : nodes),
      nodeDefRoot,
      nodeDefsByUuid,
      categoryItemIndex,
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

  yield call(persistRecordWithNodes, {record: _record});
}

export function* persistRecordsAndNodes() {
  yield call(perfState.start, 'persistRecordsAndNodes');
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
  }
}

export const getRecordsFiles = async ({surveyUuid, cycle}) => {
  const dirPath = getRecordsFolderPath({
    surveyUuid,
    cycle,
  });
  const files = await fs.readDir({dirPath});
  return files?.filter(
    recordFile => !recordFile.name.includes('records-summary'),
  );
};

export const getRecordsSummary = async ({surveyUuid, cycle}) => {
  const filePath = getRecordsSummaryPath({
    surveyUuid,
    cycle,
  });

  const recordsSummaryRaw = await fs.readfile({filePath});

  const rows = (recordsSummaryRaw || '').match(/[^\r\n]+/g);

  if (rows?.length > 0) {
    const recordsByUuid = (rows || [])
      .map(row => JSON.parse(row))
      .reduce(
        (acc, record) =>
          record.uuid ? Object.assign(acc, {[record.uuid]: record}) : acc,
        {},
      );

    return recordsByUuid;
  }

  return {};
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
