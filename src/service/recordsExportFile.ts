// @ts-expect-error TS(2307): Cannot find module 'utils/Files' or its correspond... Remove this comment to see the full error message
import { Files } from "utils/Files";

const recordsFolderPath = "records";
const recordsSummaryJsonPath = Files.path(recordsFolderPath, "records.json");
const filesFolderPath = "files";
const filesSummaryJsonPath = Files.path(filesFolderPath, "files.json");

const getRecordContentJsonPath = (recordUuid: any) => Files.path(recordsFolderPath, recordUuid + ".json");

const getFilePath = (fileUuid: any) => Files.path(filesFolderPath, fileUuid + ".bin");

export const RecordsExportFile = {
  recordsFolderPath,
  recordsSummaryJsonPath,
  filesFolderPath,
  filesSummaryJsonPath,
  getRecordContentJsonPath,
  getFilePath,
};
