import API from 'infra/api';
import * as fs from 'infra/fs';

const getRecords = async ({serverUrl, surveyId}) => {
  try {
    const res = await API({serverUrl}).get({
      path: `api/survey/${surveyId}/records`,
    });
    if (res.status === 204) {
      return true;
    }
    return res?.data?.list;
  } catch (error) {
    console.log('Error::recordApi:getRecords', {error});
    return false;
  }
};

const getRecord = async ({serverUrl, surveyId, recordUuid}) => {
  try {
    const res = await API({serverUrl}).get({
      path: `api/survey/${surveyId}/record/?${new URLSearchParams({
        recordUuid,
      })}`,
    });

    return res?.data;
  } catch (error) {
    console.log('Error::recordApi:getRecord', {error});
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

const recordsApi = {getRecords, getRecord, getNodeFile};

export default recordsApi;
