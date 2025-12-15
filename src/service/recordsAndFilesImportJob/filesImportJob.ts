import { JobMobile } from "model";
import { Files } from "utils";
import { RecordsExportFile } from "../recordsExportFile";
import { RecordFileService } from "../recordFileService";
import { RecordsAndFilesImportJobContext } from "./RecordsAndFilesImportJobContext";

export class FilesImportJob extends JobMobile<RecordsAndFilesImportJobContext> {
  constructor({ survey, recordUuids, user, fileUri }: any) {
    super({ survey, recordUuids, user, fileUri });
  }

  async execute() {
    const { survey, unzippedFolderUri } = this.context;

    const filesSummaryJsonUri = Files.path(
      unzippedFolderUri,
      RecordsExportFile.filesSummaryJsonPath
    );
    const filesSummaryObj = await Files.readJsonFromFile({
      fileUri: filesSummaryJsonUri,
    });
    if (!filesSummaryObj) return;

    const filesSummary = filesSummaryObj as any[];

    this.summary.total = filesSummary.length;

    for (const fileSummary of filesSummary) {
      const { uuid: fileUuid } = fileSummary;

      const sourceFileUri = Files.path(
        unzippedFolderUri,
        RecordsExportFile.getFilePath(fileUuid)
      );

      await RecordFileService.saveRecordFile({
        surveyId: survey.id,
        fileUuid,
        sourceFileUri,
      });

      this.incrementProcessedItems();
    }
  }
}
