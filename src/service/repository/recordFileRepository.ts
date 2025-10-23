import { Files } from "utils";
import { GenericFileRepository } from "./genericFileRepository";

const SURVEY_RECORD_FILES_DIR_NAME = "survey_record_files";

const getRecordFilesParentDirectoryUri = () =>
  `${GenericFileRepository.getDirUri(SURVEY_RECORD_FILES_DIR_NAME)}`;

const getRecordFilesParentDirectorySize = async () =>
  Files.getDirSize(getRecordFilesParentDirectoryUri());

const getRecordFileDirectoryUri = ({ surveyId }) =>
  `${getRecordFilesParentDirectoryUri()}/${surveyId}`;

const getRecordFilesDirectorySize = async ({ surveyId }) =>
  Files.getDirSize(getRecordFileDirectoryUri({ surveyId }));

const getRecordFileUri = ({ surveyId, fileUuid }) =>
  `${getRecordFileDirectoryUri({ surveyId })}/${fileUuid}`;

const saveRecordFile = async ({ surveyId, fileUuid, sourceFileUri }) => {
  await GenericFileRepository.makeDirIfNotExists(
    getRecordFileDirectoryUri({ surveyId })
  );

  const fileUriTarget = getRecordFileUri({ surveyId, fileUuid });

  await GenericFileRepository.copyFile({
    from: sourceFileUri,
    to: fileUriTarget,
  });
};

const deleteRecordFile = async ({ surveyId, fileUuid }) => {
  const fileUri = getRecordFileUri({ surveyId, fileUuid });
  await GenericFileRepository.deleteFile(fileUri);
};

export const RecordFileRepository = {
  getRecordFilesParentDirectoryUri,
  getRecordFilesParentDirectorySize,
  getRecordFilesDirectorySize,
  getRecordFileUri,
  saveRecordFile,
  deleteRecordFile,
};
