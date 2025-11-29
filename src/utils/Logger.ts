import * as FileSystem from "expo-file-system/legacy";
import {
  consoleTransport,
  fileAsyncTransport,
  logger,
} from "react-native-logs";

const LOG_FILE_MAX_SIZE = 1024 * 1024; // Example: 1 MB
const MAX_LOG_FILES = 5;
const config = {
  transport:
    //   __DEV__ ? consoleTransport :
    fileAsyncTransport,

  transportOptions: {
    FS: FileSystem,
    fileName: "am.log",
    rotate: true,
    maxSize: LOG_FILE_MAX_SIZE,
    numOfFiles: MAX_LOG_FILES,
  },
};

export const log = logger.createLogger(config);
