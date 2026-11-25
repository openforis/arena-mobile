import { JobMobile } from "model";
import { Files } from "utils";

import { FilesImportJob } from "./filesImportJob";
import { RecordsAndFilesImportJobContext } from "./RecordsAndFilesImportJobContext";
import { RecordsImportJob, RecordsImportJobResult } from "./recordsImportJob";

export type RecordsAndFilesImportJobResult = RecordsImportJobResult & {
  processedRecords: number;
};

export class RecordsAndFilesImportJob extends JobMobile<
  RecordsAndFilesImportJobContext,
  RecordsAndFilesImportJobResult
> {
  constructor(context: RecordsAndFilesImportJobContext) {
    const {
      survey,
      user,
      fileUri,
      overwriteExistingRecords = true,
      mergeKeepLocalOriginRecordUuids,
    } = context;
    super(
      {
        survey,
        user,
        fileUri,
        overwriteExistingRecords,
        mergeKeepLocalOriginRecordUuids,
      },
      [
        new RecordsImportJob({
          survey,
          user,
          overwriteExistingRecords,
          mergeKeepLocalOriginRecordUuids,
        }),
        new FilesImportJob({ survey, user, fileUri }),
      ],
    );
  }

  override async onStart() {
    await super.onStart();
    const { fileUri } = this.context;

    const unzippedFolderUri = await this.createTempFolder();

    await Files.unzip(fileUri!, unzippedFolderUri, "UTF-8");

    this.context.unzippedFolderUri = unzippedFolderUri;
  }

  override generateResult(): Promise<RecordsAndFilesImportJobResult> {
    const recordsImportJob = this.innerJobs?.[0];
    const { result = {}, processed = 0 } = recordsImportJob ?? {};
    return Promise.resolve({ ...result, processedRecords: processed });
  }
}
