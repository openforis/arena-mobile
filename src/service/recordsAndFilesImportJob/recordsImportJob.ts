import { JobMobile } from "model";
import { ArrayUtils, Files } from "utils";

import { RecordsExportFile } from "../recordsExportFile";
import { RecordService } from "../recordService";
import { Record } from "@openforis/arena-core";

export class RecordsImportJob extends JobMobile {
  insertedRecords: any;
  updatedRecords: any;
  async execute() {
    const { survey, unzippedFolderUri, overwriteExistingRecords } =
      this.context;

    const fileRecordsSummaryJsonUri = Files.path(
      unzippedFolderUri,
      RecordsExportFile.recordsSummaryJsonPath
    );
    const fileRecordsSummaryObj = await Files.readJsonFromFile({
      fileUri: fileRecordsSummaryJsonUri,
    });

    if (!fileRecordsSummaryObj) {
      return;
    }

    const fileRecordsSummary = fileRecordsSummaryObj as any[];

    this.summary.total = fileRecordsSummary.length;
    this.insertedRecords = 0;
    this.updatedRecords = 0;

    const recordsSummary = await RecordService.fetchRecords({
      survey,
      onlyLocal: false,
    });
    const recordsSummaryByUuid = ArrayUtils.indexByUuid(recordsSummary);

    for (const recordUuidAndCycle of fileRecordsSummary) {
      const { uuid: recordUuid } = recordUuidAndCycle;
      const contentPath = Files.path(
        unzippedFolderUri,
        RecordsExportFile.getRecordContentJsonPath(recordUuid)
      );
      const recordObj = await Files.readJsonFromFile({ fileUri: contentPath });
      if (!recordObj)
        throw new Error(`missing file in archive for record ${recordUuid}`);
      const record = recordObj as Record;
      if (record.surveyUuid && record.surveyUuid !== survey.uuid)
        throw new Error(
          `this record cannot be imported in the current survey; it has been created with another one;`
        );

      const existingRecordSummary = recordsSummaryByUuid[recordUuid];
      if (!existingRecordSummary) {
        await RecordService.insertRecord({ survey, record });
        this.insertedRecords++;
      } else if (overwriteExistingRecords) {
        await RecordService.updateRecordWithContentFetchedRemotely({
          survey,
          record,
        });
        this.updatedRecords++;
      }
      this.incrementProcessedItems();
    }
  }

  override async prepareResult() {
    const { insertedRecords, updatedRecords } = this;
    return { insertedRecords, updatedRecords };
  }
}
