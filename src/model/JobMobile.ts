import { JobBase } from "@openforis/arena-core";

export class JobMobile extends JobBase {
  createLogger() {
    const log = (message) => console.log(message);
    return {
      debug: (message) => log(message),
      error: (message) => log(message),
      warning: (message) => log(message),
    };
  }
}
