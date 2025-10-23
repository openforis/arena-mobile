import { JobMobile } from "model";
import { Files } from "utils";
import { RecordsExportFile } from "../recordsExportFile";
import { RecordFileService } from "../recordFileService";

// @ts-expect-error TS(2507): Type 'typeof JobMobile' is not a constructor funct... Remove this comment to see the full error message
export class FilesImportJob extends JobMobile {
  context: any;
  incrementProcessedItems: any;
  summary: any;
  constructor({
    survey,
    recordUuids,
    user,
    fileUri
  }: any) {
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
