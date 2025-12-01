import {
  logger,
  fileAsyncTransport,
  consoleTransport,
} from "react-native-logs";
import * as FileSystem from "expo-file-system/legacy";
import { Files } from "./Files";

const maxRotatedFiles = 5; // Total log files will be 6 (Current + 5 Rotated)
const logFileNamePrefix = "arena-mobile";
const logFileName = `${logFileNamePrefix}.log`;

const logsDirectory = "logs";
const logsPath = Files.path(Files.documentDirectory, logsDirectory);

let _log: ReturnType<typeof logger.createLogger> | null = null;

enum LogLevel {
  Debug = "debug",
  Info = "info",
  Warning = "warn",
  Error = "error",
}

/**
 * Executes the rotation logic at startup. It shifts log files up by one index
 * (1 -> 2, 2 -> 3, etc.) and deletes the oldest (MAX_ROTATED_FILES).
 * @param filePath The full path to the log file directory.
 */
const rotateLogFilesOnStartup = async (filePath: string): Promise<void> => {
  const currentLogPath = Files.path(filePath, logFileName);

  try {
    const currentLogInfo = await FileSystem.getInfoAsync(currentLogPath);

    if (currentLogInfo.exists) {
      console.log("Log file found at startup. Initiating rotation...");

      const oldestLogFileName = `${logFileNamePrefix}.${maxRotatedFiles}.log`;
      // 1. Delete the oldest log file (arena-mobile.5.log)
      const oldestLogPath = Files.path(filePath, oldestLogFileName);
      await FileSystem.deleteAsync(oldestLogPath, { idempotent: true });
      console.log(`Deleted oldest log: ${oldestLogFileName}`);

      // 2. Shift existing rotated files up (e.g., 4 -> 5, 3 -> 4, etc.)
      for (let i = maxRotatedFiles - 1; i >= 1; i--) {
        const oldPath = Files.path(filePath, `${logFileNamePrefix}.${i}.log`);
        const newPath = Files.path(
          filePath,
          `${logFileNamePrefix}.${i + 1}.log`
        );
        if (await Files.exists(oldPath)) {
          await Files.moveFile({ from: oldPath, to: newPath });
        }
      }

      // 3. Rename the current log file (arena-mobile.log) to the first rotated file (arena-mobile.1.log)
      const newPrimaryBackupPath = Files.path(filePath, `arena-mobile.1.log`);
      await Files.moveFile({ from: currentLogPath, to: newPrimaryBackupPath });
      // The logger will now create a fresh arena-mobile.log for new entries.
    }
  } catch (error) {
    console.error("Error during startup log rotation:", error);
  }
};

export const initializeLogger = async () => {
  await Files.mkDir(logsPath);

  try {
    // 1. **Perform file rotation here, before logger creation**
    // This ensures arena-mobile.log is empty and ready for new logs.
    await rotateLogFilesOnStartup(logsPath);

    // 2. Create the logger using the standard, fast fileAsyncTransport
    _log = logger.createLogger({
      severity: "debug",
      // We can use the standard transport since rotation is done at startup
      transport: __DEV__ ? consoleTransport : fileAsyncTransport,
      transportOptions: {
        FS: FileSystem,
        fileName: logFileName,
        filePath: logsPath,
      },
    });
  } catch (error) {
    console.error("Error initializing logger: " + error);
  }
};

const argToString = (arg: any): string => {
  if (typeof arg === "string") {
    return arg;
  } else if (arg instanceof Error) {
    return arg.message;
  } else {
    try {
      return JSON.stringify(arg);
    } catch {
      return String(arg);
    }
  }
};
const write = (level: LogLevel, ...args: any[]) => {
  const msg = args.map(argToString).join(" ");
  try {
    _log ? _log[level]?.(msg) : console.log(msg);
  } catch (error) {
    console.log(msg);
  }
};

export const log = {
  debug: (...args: any[]) => {
    write(LogLevel.Debug, ...args);
  },
  info: (...args: any[]) => {
    write(LogLevel.Info, ...args);
  },
  warn: (...args: any[]) => {
    write(LogLevel.Warning, ...args);
  },
  error: (...args: any[]) => {
    write(LogLevel.Error, ...args);
  },
};
