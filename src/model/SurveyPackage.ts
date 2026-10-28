// Survey package downloaded from the server: same entry names of the Arena format export
// (arena: server/modules/survey/service/surveyExport/exportFile.js)
const infoFileName = "info.json";
const surveyFileName = "survey.json";
const surveyFilesDirName = "surveyfiles";
const mobileSurveyExportType = "mobileSurvey";

const getSurveyFileEntryName = (fileUuid: string): string =>
  `${surveyFilesDirName}/${fileUuid}.bin`;

// a missing info is accepted; other export types (e.g. a full Arena export) cannot be imported yet
const isSupportedInfo = (info: unknown): boolean => {
  if (info === null || info === undefined) return true;
  return (info as { exportType?: string }).exportType === mobileSurveyExportType;
};

export const SurveyPackage = {
  infoFileName,
  surveyFileName,
  surveyFilesDirName,
  getSurveyFileEntryName,
  isSupportedInfo,
};
