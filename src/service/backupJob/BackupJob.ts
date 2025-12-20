import { DateFormats, Dates } from "@openforis/arena-core";
import { JobMobile, JobMobileContext } from "model";
import { Files } from "utils";

const outputFileNamePrefix = `arena_mobile_full_backup_`;

type BackupJobContext = JobMobileContext & {
  outputFileUri?: string;
};

export class BackupJob extends JobMobile<BackupJobContext> {
  async execute() {
    await super.onStart();

    const timestamp = Dates.format(new Date(), DateFormats.datetimeDefault);
    const outputFileName = `${outputFileNamePrefix}${timestamp}.zip`;

    const outputFileUri = Files.path(Files.cacheDirectory, outputFileName);

    await Files.zip(Files.documentDirectory, outputFileUri);

    this.context.outputFileUri = outputFileUri;
  }

  override async prepareResult() {
    const { outputFileUri } = this.context;
    return { outputFileUri };
  }
}
