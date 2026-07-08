import { Files } from "utils";
import { GenericFileRepository } from "./genericFileRepository";

const SURVEY_RECORD_FILES_DIR_NAME = "survey_record_files";

const getRecordFilesParentDirectoryUri = () =>
  `${GenericFileRepository.getDirUri(SURVEY_RECORD_FILES_DIR_NAME)}`;

const getRecordFilesParentDirectorySize = async () =>
  Files.getDirSize(getRecordFilesParentDirectoryUri());

const getRecordFileDirectoryUri = ({ surveyId }: { surveyId: number }) =>
  `${getRecordFilesParentDirectoryUri()}/${surveyId}`;

const getRecordFilesDirectorySize = async ({
  surveyId,
}: {
  surveyId: number;
}) => Files.getDirSize(getRecordFileDirectoryUri({ surveyId }));

const getRecordFileUri = ({
  surveyId,
  fileUuid,
}: {
  surveyId: number;
  fileUuid: string;
}) => `${getRecordFileDirectoryUri({ surveyId })}/${fileUuid}`;

const saveRecordFile = async ({
  surveyId,
  fileUuid,
  sourceFileUri,
}: {
  surveyId: number;
  fileUuid: string;
  sourceFileUri: string;
}) => {
  await GenericFileRepository.makeDirIfNotExists(
    getRecordFileDirectoryUri({ surveyId }),
  );

  const fileUriTarget = getRecordFileUri({ surveyId, fileUuid });

  await GenericFileRepository.copyFile({
    from: sourceFileUri,
    to: fileUriTarget,
  });
};

const recordFileMissing = async ({
  surveyId,
  fileUuid,
}: {
  surveyId: number;
  fileUuid: string;
}) => {
  if (!fileUuid) {
    return false;
  }
  const fileUri = getRecordFileUri({ surveyId, fileUuid });
  return !(await Files.exists(fileUri));
};

const deleteRecordFile = async ({
  surveyId,
  fileUuid,
}: {
  surveyId: number;
  fileUuid: string;
}) => {
  const fileUri = getRecordFileUri({ surveyId, fileUuid });
  await GenericFileRepository.deleteFile(fileUri);
};

export const RecordFileRepository = {
  getRecordFilesParentDirectoryUri,
  getRecordFilesParentDirectorySize,
  getRecordFilesDirectorySize,
  getRecordFileUri,
  recordFileMissing,
  saveRecordFile,
  deleteRecordFile,
};
