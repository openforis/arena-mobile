import { JobMobile } from "model";
import { Files } from "utils";
import { RecordsExportFile } from "../recordsExportFile";
import { RecordFileService } from "../recordFileService";

export class FilesImportJob extends JobMobile {
  constructor({ survey, recordUuids, user, fileUri }) {
    super({ survey, recordUuids, user, fileUri });
  }

  async execute() {
    const { survey, unzippedFolderUri } = this.context;

    const filesSummaryJsonUri = Files.path(
      unzippedFolderUri,
      RecordsExportFile.filesSummaryJsonPath
    );
    const filesSummary = await Files.readJsonFromFile({
      fileUri: filesSummaryJsonUri,
    });
    if (!filesSummary) return;

    this.summary.total = filesSummary.length;

    for await (const fileSummary of filesSummary) {
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
