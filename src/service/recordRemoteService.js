import { Files } from "utils";

import { RemoteService } from "./remoteService";

const fetchRecordsSummaries = async ({ surveyRemoteId, cycle }) => {
  const { data } = await RemoteService.get(
    `api/survey/${surveyRemoteId}/records/summary`,
    { cycle }
  );
  const { list } = data;
  return list;
};

const startExportRecords = async ({ survey, cycle, recordUuids }) => {
  const { remoteId: surveyRemoteId } = survey;
  const params = { cycle, recordUuids };

  const {
    data: { job },
  } = await RemoteService.post(
    `api/survey/${surveyRemoteId}/records/export`,
    params
  );
  return job;
};

const downloadExportedRecordsFile = async ({ survey, fileName }) => {
  const { remoteId: surveyRemoteId } = survey;
  const fileUri = await RemoteService.getFile(
    `api/survey/${surveyRemoteId}/records/export/download`,
    { fileName }
  );
  return fileUri;
};

const uploadRecords = async ({
  survey,
  cycle,
  fileUri,
  conflictResolutionStrategy,
}) => {
  const surveyRemoteId = survey.remoteId;
  const params = {
    file: {
      uri: fileUri,
      name: "arena-mobile-data.zip",
      type: Files.MIME_TYPES.zip,
    },
    cycle,
    conflictResolutionStrategy,
  };
  const { data } = await RemoteService.postMultipartData(
    `api/mobile/survey/${surveyRemoteId}`,
    params
  );
  const { job } = data;
  return job;
};

export const RecordRemoteService = {
  fetchRecordsSummaries,
  startExportRecords,
  downloadExportedRecordsFile,
  uploadRecords,
};
