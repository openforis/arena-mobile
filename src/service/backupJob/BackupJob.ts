import { DateFormats, Dates } from "@openforis/arena-core";
import { JobMobile } from "model";
import { Files } from "utils";

const outputFileNamePrefix = `arena_mobile_full_backup_`;

// @ts-expect-error TS(2507): Type 'typeof JobMobile' is not a constructor funct... Remove this comment to see the full error message
export class BackupJob extends JobMobile {
  context: any;
  async execute() {
    await super.onStart();

    const timestamp = Dates.format(new Date(), DateFormats.datetimeDefault);
    const outputFileName = `${outputFileNamePrefix}${timestamp}.zip`;

    const outputFileUri = Files.path(Files.cacheDirectory, outputFileName);

    await Files.zip(Files.documentDirectory, outputFileUri);

    this.context.outputFileUri = outputFileUri;
  }

  async prepareResult() {
    const { outputFileUri } = this.context;
    return { outputFileUri };
  }
}
