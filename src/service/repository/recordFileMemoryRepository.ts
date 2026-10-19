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

const getRecordFilesParentDirectorySize = async () => 0;

const getRecordFilesDirectorySize = async (_params: { surveyId: number }) => 0;

const getRecordFileUri = (params: { surveyId: number; fileUuid: string }) =>
  fileUriByKey.get(toKey(params)) ?? "";

const saveRecordFile = async ({
  surveyId,
  fileUuid,
  sourceFileUri,
}: {
  surveyId: number;
  fileUuid: string;
  sourceFileUri: string;
}) => {
  fileUriByKey.set(toKey({ surveyId, fileUuid }), sourceFileUri);
};

const recordFileMissing = async (params: {
  surveyId: number;
  fileUuid: string;
}) => !!params.fileUuid && !fileUriByKey.has(toKey(params));

const deleteRecordFile = async (params: {
  surveyId: number;
  fileUuid: string;
}) => {
  fileUriByKey.delete(toKey(params));
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
