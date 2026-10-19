// record files kept in memory (web preview mode, no file system): picked files are referenced by their (blob/data) URI
const fileUriByKey = new Map<string, string>();

const toKey = ({
  surveyId,
  fileUuid,
}: {
  surveyId: number;
  fileUuid: string;
}) => `${surveyId}/${fileUuid}`;

const getRecordFilesParentDirectoryUri = () => "";

// same async API as RecordFileRepository
const getRecordFilesParentDirectorySize = (): Promise<number> =>
  Promise.resolve(0);

const getRecordFilesDirectorySize = (_params: {
  surveyId: number;
}): Promise<number> => Promise.resolve(0);

const getRecordFileUri = (params: { surveyId: number; fileUuid: string }) =>
  fileUriByKey.get(toKey(params)) ?? "";

const saveRecordFile = ({
  surveyId,
  fileUuid,
  sourceFileUri,
}: {
  surveyId: number;
  fileUuid: string;
  sourceFileUri: string;
}): Promise<void> => {
  fileUriByKey.set(toKey({ surveyId, fileUuid }), sourceFileUri);
  return Promise.resolve();
};

const recordFileMissing = (params: {
  surveyId: number;
  fileUuid: string;
}): Promise<boolean> =>
  Promise.resolve(!!params.fileUuid && !fileUriByKey.has(toKey(params)));

const deleteRecordFile = (params: {
  surveyId: number;
  fileUuid: string;
}): Promise<void> => {
  fileUriByKey.delete(toKey(params));
  return Promise.resolve();
};

export const RecordFileMemoryRepository = {
  getRecordFilesParentDirectoryUri,
  getRecordFilesParentDirectorySize,
  getRecordFilesDirectorySize,
  getRecordFileUri,
  recordFileMissing,
  saveRecordFile,
  deleteRecordFile,
};
