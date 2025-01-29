import { JobStatus } from "@openforis/arena-core";

import { dbClient } from "db";
import { Files } from "utils";

import { AuthService } from "./authService";
import { BackupJob } from "./backupJob/BackupJob";
import { RecordFileRepository } from "./repository/recordFileRepository";
import { SurveyFSRepository } from "./repository/surveyFSRepository";
import { SettingsService } from "./settingsService";

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
  const job = new BackupJob({ user: {} });
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

const checkLoggedInUser = async () => {
  const settings = await SettingsService.fetchSettings();
  const { serverUrl, email, password } = settings;
  if (!serverUrl || !email || !password) return;

  try {
    const user = await AuthService.fetchUser();
    return user;
  } catch (error) {
    // session expired
    const { user } = await AuthService.login({ serverUrl, email, password });
    return user;
  }
};

export const AppService = {
  estimateFullBackupSize,
  generateFullBackup,
  checkLoggedInUser,
};
