import { Dates, JobStatus, User } from "@openforis/arena-core";

import { dbClient } from "db";
import { Files, logsPath } from "utils";

import { BackupJob } from "./backupJob/BackupJob";
import { RecordFileRepository } from "./repository/recordFileRepository";
import { SurveyFSRepository } from "./repository/surveyFSRepository";
import { SettingsService } from "./settingsService";
import { UserService } from "./userService";

const getDbUri = () =>
  Files.path(Files.documentDirectory, "SQLite", dbClient?.name);

const estimateFullBackupSize = async () => {
  const recordFilesSize =
    await RecordFileRepository.getRecordFilesParentDirectorySize();
  const surveysSize = await SurveyFSRepository.getStorageSize();
  const dbSize = await Files.getSize(getDbUri());
  return dbSize + surveysSize + recordFilesSize;
};

const generateFullBackup = async () => {
  const job = new BackupJob({ user: {} as User });
  await job.start();

  const { status, result } = job.summary;
  switch (status) {
    case JobStatus.succeeded:
      return result.outputFileUri;
    case JobStatus.failed:
      throw new Error(JSON.stringify(job.summary.errors));
    default:
      return null;
  }
};

const exportLogsAndShareThem = async () => {
  // Create a temp file path for the zip
  const timestamp = Dates.nowFormattedForExpression();
  const zipFileName = `arena-mobile-logs-${timestamp}.zip`;
  const zipFileUri = Files.path(Files.cacheDirectory, zipFileName);

  // Zip the logs directory
  await Files.zip(logsPath, zipFileUri);

  // Share the zip file
  await Files.shareFile({
    url: zipFileUri,
    mimeType: Files.MIME_TYPES.zip,
    dialogTitle: "Share Logs",
  });

  // Clean up temp file after sharing
  await Files.del(zipFileUri, true);

  return zipFileUri;
};

const checkLoggedInUser = async () => {
  const settings = await SettingsService.fetchSettings();
  const { serverUrl, email } = settings;
  if (!serverUrl || !email) return;

  try {
    const user = await UserService.fetchUser();
    return user;
  } catch (error) {
    // session expired
    return null;
  }
};

export const AppService = {
  estimateFullBackupSize,
  generateFullBackup,
  exportLogsAndShareThem,
  checkLoggedInUser,
};
