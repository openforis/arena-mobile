import { JobBase } from "@openforis/arena-core";

// @ts-expect-error TS(2707): Generic type 'JobBase<C, R>' requires between 1 an... Remove this comment to see the full error message
export class JobMobile extends JobBase {
  createLogger() {
    const log = (message: any) => console.log(message);
    return {
      debug: (message: any) => log(message),
      error: (message: any) => log(message),
      warning: (message: any) => log(message),
    };
  }
}
