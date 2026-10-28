import { ArenaExportType } from "@openforis/arena-core";

// Survey package downloaded from the server: a subset of the Arena format export (entry names in ArenaExportFile)

// a missing info is accepted; other export types (e.g. a full Arena export) cannot be imported yet
const isSupportedInfo = (info: unknown): boolean => {
  if (info === null || info === undefined) return true;
  return (
    (info as { exportType?: string }).exportType ===
    ArenaExportType.mobileSurvey
  );
};

export const SurveyPackage = {
  isSupportedInfo,
};
