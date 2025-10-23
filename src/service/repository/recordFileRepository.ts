// @ts-expect-error TS(2307): Cannot find module 'utils' or its corresponding ty... Remove this comment to see the full error message
import { Files } from "utils";
import { GenericFileRepository } from "./genericFileRepository";

const SURVEY_RECORD_FILES_DIR_NAME = "survey_record_files";

const getRecordFilesParentDirectoryUri = () =>
  `${GenericFileRepository.getDirUri(SURVEY_RECORD_FILES_DIR_NAME)}`;

const getRecordFilesParentDirectorySize = async () =>
  Files.getDirSize(getRecordFilesParentDirectoryUri());

const getRecordFileDirectoryUri = ({
  surveyId
}: any) =>
  `${getRecordFilesParentDirectoryUri()}/${surveyId}`;

const getRecordFilesDirectorySize = async ({
  surveyId
}: any) =>
  Files.getDirSize(getRecordFileDirectoryUri({ surveyId }));

const getRecordFileUri = ({
  surveyId,
  fileUuid
}: any) =>
  `${getRecordFileDirectoryUri({ surveyId })}/${fileUuid}`;

const saveRecordFile = async ({
  surveyId,
  fileUuid,
  sourceFileUri
}: any) => {
  await GenericFileRepository.makeDirIfNotExists(
    getRecordFileDirectoryUri({ surveyId })
  );

  const fileUriTarget = getRecordFileUri({ surveyId, fileUuid });

  await GenericFileRepository.copyFile({
    from: sourceFileUri,
    to: fileUriTarget,
  });
};

const deleteRecordFile = async ({
  surveyId,
  fileUuid
}: any) => {
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
