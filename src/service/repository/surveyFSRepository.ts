import { ArenaExportFile } from "@openforis/arena-core";

import { Files } from "utils/Files";
import { GenericFileRepository } from "./genericFileRepository";

const SURVEY_FILES_DIR_NAME = "survey_files";

const getSurveyFilesDirUri = () =>
  GenericFileRepository.getDirUri(SURVEY_FILES_DIR_NAME);

const getSurveyFileUri = ({ surveyId }: any) =>
  `${getSurveyFilesDirUri()}/${surveyId}.json`;

// package files (info.json, surveyfiles/) are stored in a folder next to the survey JSON file
const getSurveyPackageDirUri = ({ surveyId }: { surveyId: number }) =>
  `${getSurveyFilesDirUri()}/${surveyId}`;

const getSurveyPackageFileUri = ({
  surveyId,
  fileUuid,
}: {
  surveyId: number;
  fileUuid: string;
}) =>
  `${getSurveyPackageDirUri({ surveyId })}/${ArenaExportFile.surveyFile({ fileUuid })}`;

const getStorageSize = async () => Files.getDirSize(getSurveyFilesDirUri());

const readSurveyFile = async ({ surveyId }: any) => {
  const fileUri = getSurveyFileUri({ surveyId });
  return Files.readJsonFromFile({ fileUri });
};

const saveSurveyFile = async (survey: any) => {
  const { id: surveyId } = survey;
  await GenericFileRepository.makeDirIfNotExists(getSurveyFilesDirUri());

  const fileUri = getSurveyFileUri({ surveyId });

  await Files.writeJsonToFile({ content: survey, fileUri });

  return survey;
};

const deleteSurveyPackageFiles = async ({ surveyId }: { surveyId: number }) => {
  await GenericFileRepository.deleteFile(getSurveyPackageDirUri({ surveyId }));
};

const moveIfExists = async ({ from, to }: { from: string; to: string }) => {
  if (await Files.exists(from)) {
    await GenericFileRepository.moveFile({ from, to });
  }
};

// replaces the package files of the survey with the ones in the unzipped package folder
const replaceSurveyPackageFiles = async ({
  surveyId,
  unzippedDirUri,
}: {
  surveyId: number;
  unzippedDirUri: string;
}) => {
  await deleteSurveyPackageFiles({ surveyId });
  const packageDirUri = getSurveyPackageDirUri({ surveyId });
  await GenericFileRepository.makeDirIfNotExists(packageDirUri);
  // independent entries: moved in parallel
  await Promise.all(
    [ArenaExportFile.info, ArenaExportFile.surveyFilesDir].map((entryName) =>
      moveIfExists({
        from: `${unzippedDirUri}/${entryName}`,
        to: `${packageDirUri}/${entryName}`,
      }),
    ),
  );
};

const existsSurveyPackageFile = async ({
  surveyId,
  fileUuid,
}: {
  surveyId: number;
  fileUuid: string;
}) => Files.exists(getSurveyPackageFileUri({ surveyId, fileUuid }));

const deleteSurveyFile = async ({ surveyId }: any) => {
  const fileUri = getSurveyFileUri({ surveyId });
  await GenericFileRepository.deleteFile(fileUri);
  await deleteSurveyPackageFiles({ surveyId });
};

export const SurveyFSRepository = {
  getStorageSize,
  readSurveyFile,
  saveSurveyFile,
  deleteSurveyFile,
  getSurveyPackageFileUri,
  existsSurveyPackageFile,
  replaceSurveyPackageFiles,
  deleteSurveyPackageFiles,
};
