import { JobMobile } from "model";
import { Files } from "utils";

import { RecordsImportJob } from "./recordsImportJob";
import { FilesImportJob } from "./filesImportJob";

// @ts-ignore
export class RecordsAndFilesImportJob extends JobMobile {
  constructor({ survey, user, fileUri, overwriteExistingRecords = true }: any) {
    super({ survey, user, fileUri, overwriteExistingRecords }, [
      new RecordsImportJob({ survey, user, fileUri, overwriteExistingRecords }),
      new FilesImportJob({ survey, user, fileUri }),
    ]);
  }

  override async onStart() {
    await super.onStart();
    const { fileUri } = this.context;

    const unzippedFolderUri = await Files.createTempFolder();

    await Files.unzip(fileUri, unzippedFolderUri, "UTF-8");

    this.context.unzippedFolderUri = unzippedFolderUri;
  }

  override async prepareResult() {
    const recordsImportJob = this.jobs?.[0];
    const recordsImportJobSummary: any = recordsImportJob?.summary ?? {};
    const { result = {}, processed } = recordsImportJobSummary;
    return { ...result, processedRecords: processed };
  }

  override async onEnd() {
    await super.onEnd();
    await Files.del(this.context.unzippedFolderUri, true);
  }
}
