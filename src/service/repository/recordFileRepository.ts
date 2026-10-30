import { Files } from "utils";
import { isValidFileUuid } from "utils/isValidFileUuid";
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

// it comes from imported records: writing or deleting must not reach another folder
const assertValidFileUuid = (fileUuid: string) => {
  if (!isValidFileUuid(fileUuid)) {
    throw new Error(`invalid file uuid: ${fileUuid}`);
  }
};

const saveRecordFile = async ({
  surveyId,
  fileUuid,
  sourceFileUri,
}: {
  surveyId: number;
  fileUuid: string;
  sourceFileUri: string;
}) => {
  assertValidFileUuid(fileUuid);
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
  assertValidFileUuid(fileUuid);
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
