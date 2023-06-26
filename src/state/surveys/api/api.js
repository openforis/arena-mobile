import API from 'infra/api';
import * as fs from 'infra/fs';

const getSurveys = async ({serverUrl}) => {
  const {data} = await API({serverUrl}).get({
    path: 'api/surveys',
    params: {draft: false},
  });
  const {list} = data;

  return list.filter(item => item.status === 'PUBLISHED');
};

const getSurveyPopulatedById = async ({serverUrl, surveyId}) => {
  const {data} = await API({serverUrl}).get({
    path: `api/mobile/survey/${surveyId}?${new URLSearchParams({
      draft: false,
    })}`,
  });
  const {survey} = data;

  return survey;
};

const uploadSurveyZip = async ({
  serverUrl,
  surveyId,
  surveyCycle,
  onStart,
  onProgress,
}) => {
  const uploadUrl = `${serverUrl}/api/mobile/survey/${surveyId}`;
  const files = [
    {
      name: 'survey.zip',
      filename: 'survey.zip',
      filepath: fs.TMP_BASE_PATH + '/survey.zip',
      filetype: 'application/zip',
    },
  ];

  return fs.uploadFiles({
    uploadUrl,
    files,
    onStart,
    onProgress,
  });
};

const surveysApi = {
  getSurveys,
  getSurveyPopulatedById,
  uploadSurveyZip,
};

export default surveysApi;
