import { JobMobile } from "model";
import { Files } from "utils";

const outputFileName = `am_full_backup.zip`;

export class BackupJob extends JobMobile {
  async execute() {
    await super.onStart();

    const outputFileUri = Files.path(Files.cacheDirectory, outputFileName);

    await Files.zip(Files.documentDirectory, outputFileUri);

    this.context.outputFileUri = outputFileUri;
  }

  async prepareResult() {
    const { outputFileUri } = this.context;
    return { outputFileUri };
  }
}
