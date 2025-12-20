import { JobBase, JobContext, Logger } from "@openforis/arena-core";
import { log } from "utils";

export type JobMobileContext = JobContext;

export abstract class JobMobile<C extends JobMobileContext> extends JobBase<
  C,
  any
> {
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
