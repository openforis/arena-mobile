import {
  DataQuery,
  DataQueryMode,
  FlatDataExportFields,
  FlatDataFiles,
  NodeDef,
  NodeDefs,
  Records,
  Survey,
  Surveys,
} from "@openforis/arena-core";

import { JobMobile } from "model/JobMobile";
import { RecordService } from "service/recordService";
import { Files } from "utils/Files";
import { FlatDataWriter } from "utils/FlatDataWriter";

export class DataExportJob extends JobMobile {
  getNodeDefsToExport() {
    const {
      survey,
      cycle,
      options,
    }: { survey: Survey; cycle: string; options: any } = this.context;
    const { exportSingleEntitiesIntoSeparateFiles } = options;
    const result: NodeDef<any>[] = [];
    Surveys.visitDescendantsAndSelfNodeDef({
      survey,
      cycle,
      nodeDef: Surveys.getNodeDefRoot({ survey }),
      visitor: (nodeDef) => {
        if (
          NodeDefs.isRoot(nodeDef) ||
          NodeDefs.isMultiple(nodeDef) ||
          (NodeDefs.isSingleEntity(nodeDef) &&
            exportSingleEntitiesIntoSeparateFiles)
        ) {
          result.push(nodeDef);
        }
      },
    });
    return result;
  }

  protected override async execute(): Promise<void> {
    const { survey } = this.context;

    const nodeDefsToExport = this.getNodeDefsToExport();

    const tempFolderUri = await Files.createTempFolder();

    await this.createDataExportFiles({ nodeDefsToExport, tempFolderUri });

    const recordSummaries = await RecordService.fetchRecords({
      survey,
      onlyLocal: false,
    });

    this.summary.total = recordSummaries.length;

    for (const recordSummary of recordSummaries) {
      await this.exportRecord({ recordSummary });
      this.incrementProcessedItems();
    }
  }

  private async createDataExportFiles({
    nodeDefsToExport,
    tempFolderUri,
  }: {
    nodeDefsToExport: NodeDef<any>[];
    tempFolderUri: string;
  }) {
    const { survey } = this.context;
    let index = 0;
    for (const nodeDef of nodeDefsToExport) {
      const query: DataQuery = {
        mode: DataQueryMode.raw,
        entityDefUuid: nodeDef.uuid,
      };
      const flatDataExportFields = FlatDataExportFields.getFlatDataExportFields(
        { survey, query }
      );
      const headers = flatDataExportFields.map((field) =>
        typeof field === "string" ? field : field.name
      );
      const fileName = FlatDataFiles.getFileName({
        nodeDef,
        index,
        extension: "csv",
      });
      const tempFileUri = Files.path(tempFolderUri, fileName);
      await FlatDataWriter.writeCsvHeaders({ fileUri: tempFileUri, headers });
    }
  }

  private async exportRecord({
    recordSummary,
    nodeDefsToExport,
  }: {
    recordSummary: any;
    nodeDefsToExport: NodeDef<any>[];
  }) {
    const { survey } = this.context;

    const record = await RecordService.fetchRecord({
      survey,
      recordId: recordSummary.id,
    });

    for (const nodeDef of nodeDefsToExport) {
      const nodes = Records.getNodesByDefUuid(nodeDef.uuid)(record);
      for (const node of nodes) {
        
      }
    }
  }
}
