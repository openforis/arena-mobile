import {
  Dates,
  NodeDefType,
  NodeDefs,
  Objects,
  Records,
} from "@openforis/arena-core";

import { JobMobile } from "model";
import { Files } from "utils";

import { RecordService } from "./recordService";
import { RecordFileService } from "./recordFileService";

const RECORDS_FOLDER_NAME = "records";
const RECORDS_SUMMARY_JSON_FILENAME = "records.json";
const FILES_FOLDER_NAME = "files";
const FILES_SUMMARY_JSON_FILENAME = "files.json";

export class RecordsExportFileGenerationJob extends JobMobile {
  constructor({ survey, cycle, recordUuids, user }) {
    super({ survey, cycle, recordUuids, user });
  }

  async execute() {
    const { survey, cycle, recordUuids, user } = this.context;

    const tempFolderUri = await Files.createTempFolder();

    try {
      const tempRecordsFolderUri = Files.path(
        tempFolderUri,
        RECORDS_FOLDER_NAME
      );

      await Files.mkDir(tempRecordsFolderUri);

      const recordsSummary = await RecordService.fetchRecords({
        survey,
        cycle,
      });

      const recordsToExport = recordsSummary.filter((recordSummary) =>
        recordUuids.includes(recordSummary.uuid)
      );

      // set total
      this.summary.total = recordsToExport.length;

      const tempRecordsSummaryJsonFileUri = Files.path(
        tempRecordsFolderUri,
        RECORDS_SUMMARY_JSON_FILENAME
      );
      await Files.writeJsonToFile({
        content: recordsToExport.map(({ uuid, cycle }) => ({ uuid, cycle })),
        fileUri: tempRecordsSummaryJsonFileUri,
      });

      const nodeDefsFile = Object.values(survey.nodeDefs).filter(
        (nodeDef) => NodeDefs.getType(nodeDef) === NodeDefType.file
      );

      const tempFilesDirUri = Files.path(tempFolderUri, FILES_FOLDER_NAME);
      await Files.mkDir(tempFilesDirUri);

      const files = [];

      for await (const recordSummary of recordsToExport) {
        const { id: recordId, uuid } = recordSummary;
        const record = await RecordService.fetchRecord({ survey, recordId });
        if (!record.ownerUuid && user) {
          record.ownerUuid = user.uuid;
        }

        const tempRecordFileUri = `${Files.path(
          tempRecordsFolderUri,
          uuid
        )}.json`;
        await Files.writeJsonToFile({
          content: record,
          fileUri: tempRecordFileUri,
        });

        if (!Objects.isEmpty(nodeDefsFile)) {
          const { recordFiles } = await this.writeRecordFiles({
            tempFolderUri,
            nodeDefsFile,
            record,
          });

          files.push(...recordFiles);
        }

        this.incrementProcessedItems();
      }

      if (files.length > 0) {
        const tempFilesSummaryJsonFileUri = Files.path(
          tempFilesDirUri,
          FILES_SUMMARY_JSON_FILENAME
        );
        await Files.writeJsonToFile({
          content: files,
          fileUri: tempFilesSummaryJsonFileUri,
        });
      }

      const outputFileName = `recordsExport-${Dates.nowFormattedForStorage()}.zip`;
      this.outputFileUri = Files.path(Files.documentDirectory, outputFileName);

      await Files.zip(tempFolderUri, this.outputFileUri);
    } finally {
      await Files.del(tempFolderUri);
    }
  }

  async writeRecordFiles({ tempFolderUri, nodeDefsFile, record }) {
    const { survey } = this.context;
    const surveyId = survey.id;

    const nodesFile = nodeDefsFile.reduce((acc, nodeDefFile) => {
      const nodeDefFileUuid = nodeDefFile.uuid;
      acc.push(...Records.getNodesByDefUuid(nodeDefFileUuid)(record));
      return acc;
    }, []);

    const recordFiles = nodesFile.reduce((acc, nodeFile) => {
      if (!nodeFile.value) return acc;

      const { fileName: name, fileSize: size, fileUuid } = nodeFile.value;

      acc.push({
        uuid: fileUuid,
        props: {
          name,
          size,
          nodeUuid: nodeFile.uuid,
          recordUuid: record.uuid,
        },
      });
      return acc;
    }, []);

    for await (const recordFile of recordFiles) {
      const { uuid: fileUuid } = recordFile;
      const fileUri = RecordFileService.getRecordFileUri({
        surveyId,
        fileUuid,
      });
      const info = await Files.getInfo(fileUri);
      if (info.exists) {
        const destUri = `${Files.path(
          tempFolderUri,
          FILES_FOLDER_NAME,
          fileUuid
        )}.bin`;
        await Files.copyFile({ from: fileUri, to: destUri });
      }
    }

    return {
      recordFiles,
    };
  }

  async prepareResult() {
    const { outputFileUri } = this;
    return { outputFileUri };
  }
}
