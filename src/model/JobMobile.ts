import { JobBase, Logger } from "@openforis/arena-core";
import { log } from "utils";

export abstract class JobMobile extends JobBase<any, any> {
  createLogger(): Logger {
    return {
      isDebugEnabled: () => true,
      isInfoEnabled: () => true,
      isWarnEnabled: () => true,
      isErrorEnabled: () => true,
      debug: (message: any) => log.debug(message),
      error: (message: any) => log.error(message),
      info: (message: any) => log.info(message),
      warn: (message: any) => log.warn(message),
    };
  }
}
