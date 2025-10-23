import { DateFormats, Dates } from "@openforis/arena-core";
// @ts-expect-error TS(2307): Cannot find module 'model' or its corresponding ty... Remove this comment to see the full error message
import { JobMobile } from "model";
// @ts-expect-error TS(2307): Cannot find module 'utils' or its corresponding ty... Remove this comment to see the full error message
import { Files } from "utils";

const outputFileNamePrefix = `arena_mobile_full_backup_`;

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
