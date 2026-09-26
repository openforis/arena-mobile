import { ArenaRecord } from "@openforis/arena-core";

import { JobMobile } from "model";
import { ArrayUtils, Files } from "utils";

import { RecordsExportFile } from "../recordsExportFile";
import { RecordService } from "../recordService";
import { RecordsAndFilesImportJobContext } from "./RecordsAndFilesImportJobContext";

export class RecordsImportJob extends JobMobile<RecordsAndFilesImportJobContext> {
  insertedRecords: any;
  updatedRecords: any;
  override async execute() {
    const {
      survey,
      unzippedFolderUri,
      overwriteExistingRecords,
    } = this.context;

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

    this.total = fileRecordsSummary.length;
    this.insertedRecords = 0;
    this.updatedRecords = 0;

    const recordsSummary = await RecordService.fetchRecords({
      survey,
      onlyLocal: false,
    });
    const recordsSummaryByUuid = ArrayUtils.indexByUuid(recordsSummary);

    for (const recordUuidAndCycle of fileRecordsSummary) {
      const { uuid: recordUuid } = recordUuidAndCycle;
      const record = await this.readRecord(recordUuid);
      const existingRecordSummary = recordsSummaryByUuid[recordUuid];
      if (!existingRecordSummary) {
        await this.insertRecord(record);
      } else if (overwriteExistingRecords) {
        await this.updateRecord(record);
      }
      this.incrementProcessedItems();
    }
  }

  private async readRecord(recordUuid: string): Promise<ArenaRecord> {
    const { survey, unzippedFolderUri } = this.context;
    const contentPath = Files.path(
      unzippedFolderUri,
      RecordsExportFile.getRecordContentJsonPath(recordUuid)
    );
    const recordObj = await Files.readJsonFromFile({ fileUri: contentPath });
    if (!recordObj)
      throw new Error(`missing file in archive for record ${recordUuid}`);
    const record = recordObj as ArenaRecord;
    if (record.surveyUuid && record.surveyUuid !== survey.uuid)
      throw new Error(
        `this record cannot be imported in the current survey; it has been created with another one;`
      );
    return record;
  }

  private shouldKeepLocalOrigin(recordUuid: string): boolean {
    const { mergeKeepLocalOriginRecordUuids = [] } = this.context;
    return mergeKeepLocalOriginRecordUuids.includes(recordUuid);
  }

  private async insertRecord(record: ArenaRecord) {
    const { survey } = this.context;
    await RecordService.insertRecord({ survey, record });
    if (this.shouldKeepLocalOrigin(record.uuid)) {
      // stamp the sync baseline, so the next status check doesn't see it as modified locally
      await RecordService.updateRecordsDateModifiedRemote({
        surveyId: survey.id,
        dateModifiedRemoteByUuid: { [record.uuid]: record.dateModified },
      });
    }
    this.insertedRecords++;
  }

  private async updateRecord(record: ArenaRecord) {
    const { survey } = this.context;
    if (this.shouldKeepLocalOrigin(record.uuid)) {
      await RecordService.updateRecordWithContentMergedFromRemote({
        survey,
        record,
      });
    } else {
      await RecordService.updateRecordWithContentFetchedRemotely({
        survey,
        record,
      });
    }
    this.updatedRecords++;
  }

  override async generateResult() {
    const { insertedRecords, updatedRecords } = this;
    return { insertedRecords, updatedRecords };
  }
}
