import {Objects} from '@openforis/arena-core';
import {call, select, put, delay} from 'redux-saga/effects';

import {selectors as appSelectors} from 'state/app';
import nodesActions from 'state/nodes/actionCreators';
import recordsActions from 'state/records/actionCreators';
import recordsApi from 'state/records/api';
import surveySelectors from 'state/survey/selectors';

function* handleImportRecord(params) {
  const {record, surveyId, surveyUuid, serverUrl, idx} = params;
  console.log(idx, surveyId, serverUrl, record.uuid);
  const recordData = yield call(recordsApi.getRecord, {
    serverUrl,
    surveyId,
    recordUuid: record.uuid,
  });

  console.log('record', recordData.uuid);
  const {nodes} = recordData;
  if (Object.keys(recordData).includes('nodes')) {
    delete recordData.nodes;
  }
  console.log('num nodes', Object.keys(nodes).length);

  if (!Objects.isEmpty(recordData)) {
    yield put(recordsActions.setRecord({record: recordData}));
    const nodeObj = {};
    Object.entries(nodes).forEach(([key, node]) => {
      nodeObj[key] = Object.assign({}, node, {surveyUuid});
    });
    yield delay(1000);
    yield put(nodesActions.setNodes({nodes: nodeObj}));

    yield delay(1000);
  }
}

function* handleImportRecords() {
  try {
    const surveyUuid = yield select(surveySelectors.getSelectedSurveyUuid);
    const surveyId = yield select(surveySelectors.getSelectedSurveyId);

    const serverUrl = yield select(appSelectors.getServerUrl);

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
    console.log('Error', error);
  } finally {
    console.log('Finally');
  }
}

export default handleImportRecords;
