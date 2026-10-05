import { Promises } from "@openforis/arena-core";

import { JobMobile } from "model";
import { Files } from "utils";
import { RecordsExportFile } from "../recordsExportFile";
import { RecordFileService } from "../recordFileService";
import { RecordsAndFilesImportJobContext } from "./RecordsAndFilesImportJobContext";

export class FilesImportJob extends JobMobile<RecordsAndFilesImportJobContext> {
  constructor({ survey, recordUuids, user, fileUri }: any) {
    super({ survey, recordUuids, user, fileUri });
  }

  override async execute() {
    const { survey, unzippedFolderUri } = this.context;

    const surveyId = survey.id!;

    const filesSummaryJsonUri = Files.path(
      unzippedFolderUri,
      RecordsExportFile.filesSummaryJsonPath,
    );
    const filesSummaryObj = await Files.readJsonFromFile({
      fileUri: filesSummaryJsonUri,
    });
    if (!filesSummaryObj) return;

    const filesSummary = filesSummaryObj as any[];

    this.total = filesSummary.length;

    await Promises.each(filesSummary, async (fileSummary) => {
      const { uuid: fileUuid } = fileSummary;

      const sourceFileUri = Files.path(
        unzippedFolderUri,
        RecordsExportFile.getFilePath(fileUuid),
      );

      await RecordFileService.saveRecordFile({
        surveyId,
        fileUuid,
        sourceFileUri,
      });

      this.incrementProcessedItems();
    });
  }
}
