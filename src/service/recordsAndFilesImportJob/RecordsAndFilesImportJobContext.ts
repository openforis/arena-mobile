import { Survey } from "@openforis/arena-core";
import { JobMobileContext } from "model/JobMobile";

export type RecordsAndFilesImportJobContext = JobMobileContext & {
  survey: Survey;
  fileUri?: string;
  overwriteExistingRecords: boolean;
  unzippedFolderUri?: string;
};
