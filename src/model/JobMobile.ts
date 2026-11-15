import { JobBase, JobContext, Logger } from "@openforis/arena-core";
import { Files } from "utils/Files";
import { log } from "utils/Logger";

export type JobMobileContext = JobContext;

export abstract class JobMobile<C extends JobMobileContext> extends JobBase<
  C,
  any
> {
  private readonly tempFolderUris: string[] = [];

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

  // deleted when the job ends, whatever its outcome
  protected async createTempFolder(): Promise<string> {
    const uri = await Files.createTempFolder();
    this.tempFolderUris.push(uri);
    return uri;
  }

  protected override async onEnd(): Promise<void> {
    await super.onEnd();
    const uris = this.tempFolderUris.splice(0);
    for (const uri of uris) {
      await Files.del(uri, true);
    }
  }
}
