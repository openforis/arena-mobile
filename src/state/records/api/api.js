import API from 'infra/api';

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
      path: `api/survey/${surveyId}/record/${recordUuid}`,
    });
    if (res.status === 204) {
      return true;
    }
    return res?.data?.record;
  } catch (error) {
    console.log('Error::recordApi:getRecord', {error});
    return false;
  }
};

const recordsApi = {getRecords, getRecord};

export default recordsApi;
