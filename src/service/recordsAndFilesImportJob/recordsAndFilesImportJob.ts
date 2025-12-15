import { JobMobile } from "model";
import { Files } from "utils";

import { FilesImportJob } from "./filesImportJob";
import { RecordsAndFilesImportJobContext } from "./RecordsAndFilesImportJobContext";
import { RecordsImportJob } from "./recordsImportJob";

// @ts-ignore
export class RecordsAndFilesImportJob extends JobMobile<RecordsAndFilesImportJobContext> {
  constructor({ survey, user, fileUri, overwriteExistingRecords = true }: any) {
    super({ survey, user, fileUri, overwriteExistingRecords }, [
      new RecordsImportJob({ survey, user, overwriteExistingRecords }),
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
