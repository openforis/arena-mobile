import {
  ArenaRecordNode,
  DataExportDefaultOptions,
  DataExportOptions,
  Dates,
  FlatDataExportModel,
  FlatDataFiles,
  NodeDef,
  NodeDefs,
  Records,
  Survey,
  Surveys,
} from "@openforis/arena-core";
import { ArenaMobileRecord } from "model/ArenaMobileRecord";

import { JobMobile, JobMobileContext } from "model/JobMobile";
import { RecordService } from "service/recordService";
import { Files } from "utils/Files";
import { FlatDataWriter } from "utils/FlatDataWriter";
import { extractRowNodeData } from "./recordFlatDataExtractor";

type FlatDataExportJobContext = JobMobileContext & {
  survey: Survey;
  cycle: string;
  options: DataExportOptions;
  outputFileUri?: string;
};

export class FlatDataExportJob extends JobMobile<FlatDataExportJobContext> {
  private tempFolderUri?: string;
  private nodeDefsToExport?: any;
  private dataExportModelByNodeDefUuid: Record<string, FlatDataExportModel> =
    {};

  constructor(context: FlatDataExportJobContext) {
    super({
      ...context,
      options: { ...DataExportDefaultOptions, ...context.options },
    });
  }

  determineNodeDefsToExport() {
    const { survey, cycle, options } = this.context;
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

    this.tempFolderUri = await Files.createTempFolder();

    this.nodeDefsToExport = this.determineNodeDefsToExport();

    await this.createDataExportFiles();

    const recordSummaries = await RecordService.fetchRecords({ survey });

    this.summary.total = recordSummaries.length;

    for (const recordSummary of recordSummaries) {
      await this.exportRecord({ recordSummary });
      this.incrementProcessedItems();
    }

    await this.generateOutputFile();
  }

  private async createDataExportFiles() {
    const { survey, cycle, options } = this.context;
    let index = 0;
    for (const nodeDef of this.nodeDefsToExport) {
      const dataExportModel = new FlatDataExportModel({
        survey,
        cycle,
        nodeDefContext: nodeDef,
        options,
      });
      const headers = dataExportModel.headers;

      this.dataExportModelByNodeDefUuid[nodeDef.uuid] = dataExportModel;

      const fileName = FlatDataFiles.getFileName({
        nodeDef,
        index,
        extension: "csv",
      });
      const tempFileUri = Files.path(this.tempFolderUri, fileName);
      await FlatDataWriter.writeCsvHeaders({ fileUri: tempFileUri, headers });
      index += 1;
    }
  }

  private async exportRecord({ recordSummary }: { recordSummary: any }) {
    const { survey } = this.context;

    const record = await RecordService.fetchRecord({
      survey,
      recordId: recordSummary.id,
    });

    let nodeDefToExportIndex = 0;
    for (const nodeDef of this.nodeDefsToExport) {
      const csvRows = this.exportRecordNodes({ nodeDef, record });

      const fileName = FlatDataFiles.getFileName({
        nodeDef,
        index: nodeDefToExportIndex,
        extension: "csv",
      });
      const tempFileUri = Files.path(this.tempFolderUri, fileName);
      const dataExportModel = this.dataExportModelByNodeDefUuid[nodeDef.uuid]!;

      await FlatDataWriter.appendCsvRows({
        fileUri: tempFileUri,
        headers: dataExportModel.headers,
        rows: csvRows,
      });
      nodeDefToExportIndex += 1;
    }
  }

  private async generateOutputFile() {
    const { survey } = this.context;
    const surveyName = Surveys.getName(survey);
    const timestamp = Dates.nowFormattedForExpression();
    const outputFileName = `arena-mobile-data-export-${surveyName}-${timestamp}.zip`;
    const outputFileUri = Files.path(Files.cacheDirectory, outputFileName);
    await Files.zip(this.tempFolderUri, outputFileUri);
  }

  private exportRecordNodes({
    nodeDef,
    record,
  }: {
    nodeDef: NodeDef<any>;
    record: ArenaMobileRecord;
  }): any[] {
    const { survey, cycle, options } = this.context;
    const { addCycle } = options;

    const csvRowsData = [];

    const nodes = Records.getNodesByDefUuid(nodeDef.uuid)(record);
    for (const node of nodes) {
      // every node will be a row in the CSV file
      const csvRowData = [];
      if (addCycle) {
        csvRowData.push(cycle);
      }
      // extract node (entity or attribute) data and ancestor attributes (or only key attributes) data
      Surveys.visitAncestorsAndSelfNodeDef({
        survey,
        nodeDef,
        visitor: (nodeDefAncestor) => {
          const ancestorNodesRowValues = this.extractAncestorNodeRowData({
            record,
            nodeDef,
            node,
            nodeDefAncestor,
          });
          csvRowData.unshift(...ancestorNodesRowValues);
        },
      });

      csvRowsData.push(csvRowData);
    }
    return csvRowsData;
  }

  private extractAncestorNodeRowData({
    record,
    nodeDef,
    node,
    nodeDefAncestor,
  }: {
    record: ArenaMobileRecord;
    nodeDef: NodeDef<any>;
    node: ArenaRecordNode;
    nodeDefAncestor: NodeDef<any>;
  }) {
    const { survey, cycle, options } = this.context;
    const { includeAncestorAttributes } = options;
    const dataExportModel = this.dataExportModelByNodeDefUuid[nodeDef.uuid]!;

    const ancestoNodeRowData = [];

    const ancestorNode = Records.getAncestor({
      record,
      node,
      ancestorDefUuid: nodeDefAncestor.uuid,
    })!;
    const ancestorAttributeDefs =
      includeAncestorAttributes || nodeDefAncestor === nodeDef
        ? dataExportModel.extractAncestorAttributeDefs(nodeDefAncestor)
        : Surveys.getNodeDefKeys({
            survey,
            cycle,
            nodeDef: nodeDefAncestor,
          });
    for (const ancestorAttrDef of ancestorAttributeDefs) {
      const ancestorAttributeNode = Records.getDescendant({
        record,
        node: ancestorNode,
        nodeDefDescendant: ancestorAttrDef,
      });
      const ancestorAttributeRowData = extractRowNodeData({
        survey,
        cycle,
        record,
        node: ancestorAttributeNode,
        nodeDef: ancestorAttrDef,
        options,
      });
      ancestoNodeRowData.push(...ancestorAttributeRowData);
    }
    return ancestoNodeRowData;
  }

  protected override async prepareResult(): Promise<any> {
    const { outputFileUri } = this.context;
    return { outputFileUri };
  }

  protected override async cleanup(): Promise<void> {
    await super.cleanup();
    if (this.tempFolderUri) {
      return Files.del(this.tempFolderUri);
    }
  }
}
