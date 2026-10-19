import { PreviewMode } from "utils/PreviewMode";

import { RecordFileMemoryRepository } from "./repository/recordFileMemoryRepository";
import { RecordFileRepository } from "./repository/recordFileRepository";

const {
  getRecordFilesParentDirectoryUri,
  getRecordFilesParentDirectorySize,
  getRecordFilesDirectorySize,
  getRecordFileUri,
  recordFileMissing,
  saveRecordFile,
  deleteRecordFile,
} = PreviewMode.isActive ? RecordFileMemoryRepository : RecordFileRepository;

export const RecordFileService = {
  getRecordFilesParentDirectoryUri,
  getRecordFilesParentDirectorySize,
  getRecordFilesDirectorySize,
  getRecordFileUri,
  recordFileMissing,
  saveRecordFile,
  deleteRecordFile,
};
