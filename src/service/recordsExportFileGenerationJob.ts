import {
  ArenaExportInfo,
  ArenaExportInfoFactory,
  DateFormats,
  Dates,
  NodeDefType,
  NodeDefs,
  Objects,
  Records,
  Survey,
  Surveys,
} from "@openforis/arena-core";

import { JobMobile } from "model";
import { Files, SystemUtils } from "utils";

import { RecordService } from "./recordService";
import { RecordFileService } from "./recordFileService";
import { JobMobileContext } from "model/JobMobile";

const INFO_JSON_FILENAME = "info.json";
const RECORDS_FOLDER_NAME = "records";
const RECORDS_SUMMARY_JSON_FILENAME = "records.json";
const FILES_FOLDER_NAME = "files";
const FILES_SUMMARY_JSON_FILENAME = "files.json";

const recordsExportFileNamePrefix = "arena_mobile_data_";

type RecordsExportFileGenerationJobContext = JobMobileContext & {
  survey: Survey;
  cycle: string;
  recordUuids: string[];
  user: any;
};

export class RecordsExportFileGenerationJob extends JobMobile<RecordsExportFileGenerationJobContext> {
  outputFileUri: any;

  constructor({ survey, cycle, recordUuids, user }: any) {
    super({ survey, cycle, recordUuids, user });
  }

  async execute() {
    const {
      survey,
      cycle,
      recordUuids,
      user,
    }: { survey: Survey; cycle: string; recordUuids: string[]; user: any } =
      this.context;

    const tempFolderUri = await Files.createTempFolder();

    try {
      const tempRecordsFolderUri = Files.path(
        tempFolderUri,
        RECORDS_FOLDER_NAME,
      );

      await Files.mkDir(tempRecordsFolderUri);

      const recordsSummary = await RecordService.fetchRecords({
        survey,
        cycle,
      });

      const recordsToExport = recordsSummary.filter((recordSummary: any) =>
        recordUuids.includes(recordSummary.uuid),
      );

      // set total
      this.summary.total = recordsToExport.length;

      const tempRecordsSummaryJsonFileUri = Files.path(
        tempRecordsFolderUri,
        RECORDS_SUMMARY_JSON_FILENAME,
      );
      await Files.writeJsonToFile({
        content: recordsToExport.map(({ uuid, cycle }: any) => ({
          uuid,
          cycle,
        })),
        fileUri: tempRecordsSummaryJsonFileUri,
      });

      const nodeDefsFile = Object.values(survey.nodeDefs ?? {}).filter(
        (nodeDef) => NodeDefs.getType(nodeDef) === NodeDefType.file,
      );

      const tempFilesDirUri = Files.path(tempFolderUri, FILES_FOLDER_NAME);
      await Files.mkDir(tempFilesDirUri);

      const files = [];

      for (const recordSummary of recordsToExport) {
        const { id: recordId, uuid } = recordSummary;
        const record = await RecordService.fetchRecord({ survey, recordId });
        if (!record.ownerUuid && user) {
          record.ownerUuid = user.uuid;
        }

        const tempRecordFileUri = `${Files.path(
          tempRecordsFolderUri,
          uuid,
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

      // files summary file
      if (files.length > 0) {
        const tempFilesSummaryJsonFileUri = Files.path(
          tempFilesDirUri,
          FILES_SUMMARY_JSON_FILENAME,
        );
        await Files.writeJsonToFile({
          content: files,
          fileUri: tempFilesSummaryJsonFileUri,
        });
      }

      // info file
      await this.writeInfoFile({ tempFolderUri });

      // create output zip file
      const timestamp = Dates.format(new Date(), DateFormats.datetimeDefault);
      const outputFileName = `${recordsExportFileNamePrefix}${timestamp}.zip`;

      // store exported file in cache directory to allow sharing it later on
      this.outputFileUri = Files.path(Files.cacheDirectory, outputFileName);

      await Files.zip(tempFolderUri, this.outputFileUri);
    } finally {
      await Files.del(tempFolderUri);
    }
  }

  private async writeInfoFile({ tempFolderUri }: { tempFolderUri: string }) {
    const { survey, user } = this.context;

    const info: ArenaExportInfo = ArenaExportInfoFactory.createInstance({
      appInfo: await SystemUtils.getApplicationInfo(),
      survey: {
        name: Surveys.getName(survey),
        uuid: survey.uuid,
      },
      exportedByUserUuid: user?.uuid,
    });
    const infoJsonFileUri = Files.path(tempFolderUri, INFO_JSON_FILENAME);
    await Files.writeJsonToFile({
      content: info,
      fileUri: infoJsonFileUri,
    });
  }

  async writeRecordFiles({ tempFolderUri, nodeDefsFile, record }: any) {
    const { survey } = this.context;
    const surveyId = survey.id;

    const nodesFile = nodeDefsFile.reduce((acc: any, nodeDefFile: any) => {
      const nodeDefFileUuid = nodeDefFile.uuid;
      acc.push(...Records.getNodesByDefUuid(nodeDefFileUuid)(record));
      return acc;
    }, []);

    const recordFiles = nodesFile.reduce((acc: any, nodeFile: any) => {
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

    for (const recordFile of recordFiles) {
      const { uuid: fileUuid } = recordFile;
      const fileUri = RecordFileService.getRecordFileUri({
        surveyId,
        fileUuid,
      });
      if (await Files.exists(fileUri)) {
        const destUri = `${Files.path(tempFolderUri, FILES_FOLDER_NAME, fileUuid)}.bin`;
        await Files.copyFile({ from: fileUri, to: destUri });
      } else {
        this.logger.error(
          `File with uuid ${fileUuid} not found for record ${record.uuid}`,
        );
      }
    }

    return {
      recordFiles,
    };
  }

  override async prepareResult() {
    const { outputFileUri } = this;
    return { outputFileUri };
  }
}
