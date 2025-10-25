import { JobBase, Logger } from "@openforis/arena-core";

export abstract class JobMobile extends JobBase<any, any> {
  createLogger(): Logger {
    const log = (message: any) => console.log(message);
    return {
      isDebugEnabled: () => true,
      isInfoEnabled: () => true,
      isWarnEnabled: () => true,
      isErrorEnabled: () => true,
      debug: (message: any) => log(message),
      error: (message: any) => log(message),
      info: (message: any) => log(message),
      warn: (message: any) => log(message),
    };
  }
}
