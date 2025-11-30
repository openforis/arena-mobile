import { FileLogger, LogLevel } from "react-native-file-logger";

import { Files } from "./Files";

const logsDirectory = "logs";
const logsPath = Files.path(Files.documentDirectory, logsDirectory);

export const initializeLogger = async () => {
  await Files.mkDir(logsPath);

  try {
    await FileLogger.configure({
      logsDirectory,
      logPrefix: "arena-mobile",
    });
  } catch (error) {
    console.log("Error initializing logger: " + error);
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
    FileLogger ? FileLogger.write(level, msg) : console.log(msg);
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
