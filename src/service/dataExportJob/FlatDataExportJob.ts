import {
  ArenaRecordNode,
  DataExportDefaultOptions,
  DataExportOptions,
  Dates,
  Dictionary,
  FlatDataExportModel,
  FlatDataFiles,
  NodeDef,
  NodeDefs,
  NodeDefType,
  Records,
  Survey,
  Surveys,
  UniqueFileNamesGenerator,
} from "@openforis/arena-core";

import { ArenaMobileRecord, JobMobile, JobMobileContext } from "model";

import { RecordFileService, RecordService } from "service";

import { Files, FlatDataWriter } from "utils";

import { extractRowNodeData } from "./recordFlatDataExtractor";

type FlatDataExportJobContext = JobMobileContext & {
  survey: Survey;
  cycle: string;
  options: DataExportOptions;
  outputFileUri?: string;
};

export type FlatDataExportJobResult = {
  outputFileUri: string;
};

export class FlatDataExportJob extends JobMobile<FlatDataExportJobContext> {
  private tempFolderUri?: string;
  private nodeDefsToExport?: NodeDef<any>[];
  private dataExportModelByNodeDefUuid: Dictionary<FlatDataExportModel> = {};
  private readonly uniqueFileNameGenerator: UniqueFileNamesGenerator =
    new UniqueFileNamesGenerator();

  constructor(context: FlatDataExportJobContext) {
    super({
      ...context,
      options: { ...DataExportDefaultOptions, ...context.options },
    });
  }

  determineNodeDefsToExport(): NodeDef<any>[] {
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

    this.logger.debug("Creating temporary folder for data export files");
    this.tempFolderUri = await Files.createTempFolder();

    this.nodeDefsToExport = this.determineNodeDefsToExport();
    this.logger.debug(`Determined nodeDefs to export:`, {
      nodeDefsToExport: this.nodeDefsToExport.map(NodeDefs.getName),
    });
    this.logger.debug("Creating data export files");
    await this.createDataExportFiles();

    this.logger.debug("Fetching records to export...");
    const recordSummaries = await RecordService.fetchRecords({ survey });
    this.logger.debug(`Found ${recordSummaries.length} records to export`);

    this.summary.total = recordSummaries.length;

    this.logger.debug("Exporting records...");
    for (const recordSummary of recordSummaries) {
      await this.exportRecord({ recordSummary });
      this.incrementProcessedItems();
    }

    await this.generateOutputFile();
  }

  private async createDataExportFiles() {
    const { survey, cycle, options } = this.context;
    const { includeFiles } = options;
    let index = 0;
    for (const nodeDef of this.nodeDefsToExport!) {
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

    if (includeFiles) {
      // create attached files subfolder
      const attachedFilesFolderUri = Files.path(
        this.tempFolderUri!,
        FlatDataFiles.attachedFilesSubfolderName
      );
      await Files.mkDir(attachedFilesFolderUri);
    }
  }

  private async exportRecord({ recordSummary }: { recordSummary: any }) {
    const { survey, options } = this.context;
    const { nullsToEmpty, includeFiles } = options;

    this.logger.debug(`Exporting data for record: ${recordSummary.id}`);

    const record = await RecordService.fetchRecord({
      survey,
      recordId: recordSummary.id,
    });

    let nodeDefToExportIndex = 0;
    for (const nodeDef of this.nodeDefsToExport!) {
      const { rowsData, fileValues } = this.exportRecordNodes({
        nodeDef,
        record,
      });

      const fileName = FlatDataFiles.getFileName({
        nodeDef,
        index: nodeDefToExportIndex,
        extension: "csv",
      });
      const tempFileUri = Files.path(this.tempFolderUri, fileName);

      await FlatDataWriter.appendCsvRows({
        fileUri: tempFileUri,
        rows: rowsData,
        options: { nullsToEmpty },
      });

      if (includeFiles && fileValues.length > 0) {
        await this.exportRecordFiles({ fileValues });
      }

      nodeDefToExportIndex += 1;
    }
  }

  private async exportRecordFiles({ fileValues }: { fileValues: any[] }) {
    const { survey } = this.context;
    const { id: surveyId } = survey;

    this.logger.debug(
      `Exporting ${fileValues.length} attached files for record`
    );

    for (const fileValue of fileValues) {
      const { fileUuid } = fileValue;
      const mappedFileName =
        this.uniqueFileNameGenerator.fileNamesByKey[fileUuid] ?? fileUuid;
      const exportedRecordFilePath = Files.path(
        this.tempFolderUri,
        FlatDataFiles.attachedFilesSubfolderName,
        mappedFileName
      );
      const sourceFileUri = RecordFileService.getRecordFileUri({
        surveyId,
        fileUuid,
      });
      await Files.copyFile({ from: sourceFileUri, to: exportedRecordFilePath });
    }
  }

  private async generateOutputFile() {
    this.logger.debug("Generating output file...");
    const { survey } = this.context;
    const surveyName = Surveys.getName(survey);
    const timestamp = Dates.nowFormattedForExpression();
    const outputFileName = `arena-mobile-data-export-${surveyName}-${timestamp}.zip`;
    const outputFileUri = Files.path(Files.cacheDirectory, outputFileName);
    this.context.outputFileUri = outputFileUri;
    await Files.zip(this.tempFolderUri, outputFileUri);
    this.logger.debug(`Output file generated: ${outputFileUri}`);
  }

  private exportRecordNodes({
    nodeDef,
    record,
  }: {
    nodeDef: NodeDef<any>;
    record: ArenaMobileRecord;
  }): { rowsData: any[][]; fileValues: any[] } {
    const { survey, cycle, options } = this.context;
    const { addCycle } = options;

    const rowsData = [];
    const totalFileValues: any[] = [];

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
          const { rowData: ancestorNodesRowValues, fileValues } =
            this.extractAncestorNodeRowData({
              record,
              nodeDef,
              node,
              nodeDefAncestor,
            });
          csvRowData.unshift(...ancestorNodesRowValues);
          totalFileValues.push(...fileValues);
        },
      });

      rowsData.push(csvRowData);
    }
    return { rowsData, fileValues: totalFileValues };
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
  }): { rowData: any[]; fileValues: any[] } {
    const { context, uniqueFileNameGenerator } = this;
    const { survey, cycle, options } = context;
    const { includeAncestorAttributes, includeFiles } = options;
    const dataExportModel = this.dataExportModelByNodeDefUuid[nodeDef.uuid]!;

    const rowData: any[] = [];
    const fileValues: any[] = [];

    const ancestorNode = Records.getAncestor({
      record,
      node,
      ancestorDefUuid: nodeDefAncestor.uuid,
    })!;
    const ancestorAttributeDefs =
      includeAncestorAttributes || nodeDefAncestor === nodeDef
        ? dataExportModel.extractAncestorAttributeDefs(nodeDefAncestor)
        : Surveys.getNodeDefKeys({ survey, cycle, nodeDef: nodeDefAncestor });
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
        uniqueFileNameGenerator,
      });
      rowData.push(...ancestorAttributeRowData);

      if (
        includeFiles &&
        ancestorAttributeNode &&
        NodeDefs.getType(ancestorAttrDef) === NodeDefType.file
      ) {
        const value = ancestorAttributeNode.value;
        if (value) {
          fileValues.push(value);
        }
      }
    }
    return { rowData, fileValues };
  }

  protected override async prepareResult(): Promise<FlatDataExportJobResult> {
    const { outputFileUri } = this.context;
    // at this point, outputFileUri must be defined
    return { outputFileUri: outputFileUri! };
  }

  protected override async cleanup(): Promise<void> {
    await super.cleanup();
    if (this.tempFolderUri) {
      return Files.del(this.tempFolderUri);
    }
  }
}
