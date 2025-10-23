import { Files } from "utils/Files";

const recordsFolderPath = "records";
const recordsSummaryJsonPath = Files.path(recordsFolderPath, "records.json");
const filesFolderPath = "files";
const filesSummaryJsonPath = Files.path(filesFolderPath, "files.json");

const getRecordContentJsonPath = (recordUuid) =>
  Files.path(recordsFolderPath, recordUuid + ".json");

const getFilePath = (fileUuid) =>
  Files.path(filesFolderPath, fileUuid + ".bin");

export const RecordsExportFile = {
  recordsFolderPath,
  recordsSummaryJsonPath,
  filesFolderPath,
  filesSummaryJsonPath,
  getRecordContentJsonPath,
  getFilePath,
};
