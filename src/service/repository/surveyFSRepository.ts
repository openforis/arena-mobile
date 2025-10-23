// @ts-expect-error TS(2307): Cannot find module 'utils/Files' or its correspond... Remove this comment to see the full error message
import { Files } from "utils/Files";
import { GenericFileRepository } from "./genericFileRepository";

const SURVEY_FILES_DIR_NAME = "survey_files";

const getSurveyFilesDirUri = () =>
  GenericFileRepository.getDirUri(SURVEY_FILES_DIR_NAME);

const getSurveyFileUri = ({
  surveyId
}: any) =>
  `${getSurveyFilesDirUri()}/${surveyId}.json`;

const getStorageSize = async () => Files.getDirSize(getSurveyFilesDirUri());

const readSurveyFile = async ({
  surveyId
}: any) => {
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

const deleteSurveyFile = async ({
  surveyId
}: any) => {
  const fileUri = getSurveyFileUri({ surveyId });
  await GenericFileRepository.deleteFile(fileUri);
};

export const SurveyFSRepository = {
  getStorageSize,
  readSurveyFile,
  saveSurveyFile,
  deleteSurveyFile,
};
