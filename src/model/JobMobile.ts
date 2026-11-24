import { JobBase, ArenaJobContext, ArenaLogger } from "@openforis/arena-core";
import { Files } from "utils/Files";
import { log } from "utils/Logger";

export type JobMobileContext = ArenaJobContext;

export abstract class JobMobile<
  C extends JobMobileContext,
  R = unknown,
> extends JobBase<C, R> {
  private readonly tempFolderUris: string[] = [];

  createLogger(): ArenaLogger {
    return {
      isDebugEnabled: () => true,
      isInfoEnabled: () => true,
      isWarnEnabled: () => true,
      isErrorEnabled: () => true,
      debug: (message: unknown) => log.debug(message),
      error: (message: unknown) => log.error(message),
      info: (message: unknown) => log.info(message),
      warn: (message: unknown) => log.warn(message),
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
    await Promise.all(uris.map((uri) => Files.del(uri, true)));
  }
}
