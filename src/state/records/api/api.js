import API from 'infra/api';
import * as fs from 'infra/fs';

const getRecords = async ({serverUrl, surveyId, cycle}) => {
  try {
    const res = await API({serverUrl}).get({
      path: `api/survey/${surveyId}/records`,
      params: {cycle},
    });
    return res?.data;
  } catch (error) {
    console.log('Error::recordApi:getRecords', {error});
    return false;
  }
};

const getRecord = async ({serverUrl, surveyId, recordUuid}) => {
  try {
    const res = await API({serverUrl}).get({
      path: `api/survey/${surveyId}/record`,
      params: {recordUuid},
    });

    return res?.data;
  } catch (error) {
    console.log('Error::recordApi:getRecord', {error});
    return false;
  }
};

const getRecordsSummary = async ({serverUrl, surveyId, cycle}) => {
  try {
    const res = await API({serverUrl}).get({
      path: `api/survey/${surveyId}/records/summary`,
      params: {cycle},
    });
    return res?.data;
  } catch (error) {
    console.log('Error::recordApi:getRecordsSummary', {error});
    return false;
  }
};

const getNodeFile = async ({
  serverUrl,
  surveyId,
  recordUuid,
  nodeUuid,
  toFile,
  onProgress,
  onStart,
}) =>
  fs.downloadFile({
    downloadUrl: `${serverUrl}/api/survey/${surveyId}/record/${recordUuid}/nodes/${nodeUuid}/file`,
    toFile,
    onProgress,
    onStart,
  });

const recordsApi = {getRecords, getRecord, getNodeFile, getRecordsSummary};

export default recordsApi;
