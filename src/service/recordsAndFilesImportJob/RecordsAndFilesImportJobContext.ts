import { Survey } from "@openforis/arena-core";
import { JobMobileContext } from "model/JobMobile";

export type RecordsAndFilesImportJobContext = JobMobileContext & {
  survey: Survey;
  fileUri?: string;
  overwriteExistingRecords?: boolean;
  // records restored from a backup as local changes: they replace the device and server versions
  restoreAsLocalChanges?: boolean;
  recordUuids?: string[];
  // uuids of records being fetched as the result of a merge with the server that kept the
  // same record uuid on this device: their origin should stay "local" instead of being flipped
  // to "remote" like a regular fetch, so they keep showing up under "records in device"
  mergeKeepLocalOriginRecordUuids?: string[];
  unzippedFolderUri?: string;
};
