import { RecordFileRepository } from "./repository/recordFileRepository";

const {
  getRecordFilesParentDirectoryUri,
  getRecordFilesParentDirectorySize,
  getRecordFilesDirectorySize,
  getRecordFileUri,
  saveRecordFile,
  deleteRecordFile,
} = RecordFileRepository;

export const RecordFileService = {
  getRecordFilesParentDirectoryUri,
  getRecordFilesParentDirectorySize,
  getRecordFilesDirectorySize,
  getRecordFileUri,
  saveRecordFile,
  deleteRecordFile,
};
