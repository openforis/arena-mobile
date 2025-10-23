import { JobMobile } from "model";
import { Files } from "utils";

import { RecordsImportJob } from "./recordsImportJob";
import { FilesImportJob } from "./filesImportJob";

// @ts-expect-error TS(2507): Type 'typeof JobMobile' is not a constructor funct... Remove this comment to see the full error message
export class RecordsAndFilesImportJob extends JobMobile {
  context: any;
  jobs: any;
  constructor({
    survey,
    user,
    fileUri,
    overwriteExistingRecords = true
  }: any) {
    super({ survey, user, fileUri, overwriteExistingRecords }, [
      // @ts-expect-error TS(2554): Expected 0 arguments, but got 1.
      new RecordsImportJob({ survey, user, fileUri, overwriteExistingRecords }),
      new FilesImportJob({ survey, user, fileUri }),
    ]);
  }

  async onStart() {
    await super.onStart();
    const { fileUri } = this.context;

    const unzippedFolderUri = await Files.createTempFolder();

    await Files.unzip(fileUri, unzippedFolderUri, "UTF-8");

    this.context.unzippedFolderUri = unzippedFolderUri;
  }

  async prepareResult() {
    const recordsImportJob = this.jobs?.[0];
    const recordsImportJobSummary = recordsImportJob?.summary ?? {};
    const { result = {}, processed } = recordsImportJobSummary;
    return { ...result, processedRecords: processed };
  }

  async onEnd() {
    await super.onEnd();
    await Files.del(this.context.unzippedFolderUri, true);
  }
}
