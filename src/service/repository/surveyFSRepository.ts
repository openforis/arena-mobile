import { ArenaExportFile, ArenaSurvey } from "@openforis/arena-core";

import { Files } from "utils/Files";
import { GenericFileRepository } from "./genericFileRepository";

const SURVEY_FILES_DIR_NAME = "survey_files";

const getSurveyFilesDirUri = () =>
  GenericFileRepository.getDirUri(SURVEY_FILES_DIR_NAME);

const getSurveyFileUri = ({ surveyId }: { surveyId: number }) =>
  `${getSurveyFilesDirUri()}/${surveyId}.json`;

const toTempFileUri = (fileUri: string) => `${fileUri}.tmp`;

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

const readSurveyFile = async ({
  surveyId,
}: {
  surveyId: number;
}): Promise<ArenaSurvey> => {
  const fileUri = getSurveyFileUri({ surveyId });
  const tempFileUri = toTempFileUri(fileUri);
  // on iOS the move deletes the target first: an interruption can leave only the temp file
  if (!(await Files.exists(fileUri)) && (await Files.exists(tempFileUri))) {
    await Files.moveFile({ from: tempFileUri, to: fileUri });
  }
  return (await Files.readJsonFromFile({ fileUri })) as ArenaSurvey;
};

const saveSurveyFile = async <T extends ArenaSurvey>(survey: T): Promise<T> => {
  const surveyId = survey.id!;
  await GenericFileRepository.makeDirIfNotExists(getSurveyFilesDirUri());

  const fileUri = getSurveyFileUri({ surveyId });

  // temp file + move: a failure mid-write must not corrupt the existing survey file
  const tempFileUri = toTempFileUri(fileUri);
  await Files.writeJsonToFile({ content: survey, fileUri: tempFileUri });
  await Files.moveFile({ from: tempFileUri, to: fileUri });

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

const deleteSurveyFile = async ({ surveyId }: { surveyId: number }) => {
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
  replaceSurveyPackageFiles,
  deleteSurveyPackageFiles,
};
