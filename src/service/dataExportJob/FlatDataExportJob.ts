import {
  ArenaRecord,
  ArenaRecordNode,
  CategoryItems,
  DataExportOptions,
  DataQuery,
  DataQueryMode,
  Dates,
  FlatDataExportFields,
  FlatDataFiles,
  NodeDef,
  NodeDefs,
  NodeDefType,
  NodeValueFormatter,
  NodeValues,
  Records,
  Survey,
  Surveys,
} from "@openforis/arena-core";

import { JobMobile, JobMobileContext } from "model/JobMobile";
import { RecordService } from "service/recordService";
import { Files } from "utils/Files";
import { FlatDataWriter } from "utils/FlatDataWriter";

type RowDataExtractor = ({
  survey,
  cycle,
  record,
  node,
  nodeDef,
  options,
}: {
  survey: Survey;
  cycle: string;
  record: any;
  node: any;
  nodeDef: NodeDef<any>;
  options: DataExportOptions;
}) => any[];

const rowDataExtractorByNodeDefType: Partial<
  Record<NodeDefType, RowDataExtractor>
> = {
  [NodeDefType.code]: ({ survey, node, options }) => {
    const itemUuid = NodeValues.getItemUuid(node);
    if (itemUuid) {
      const item = Surveys.getCategoryItemByUuid({ survey, itemUuid });
      if (item) {
        const result = [CategoryItems.getCode(item)];
        if (options.includeCategoryItemsLabels) {
          const label = CategoryItems.getLabel(
            item,
            Surveys.getDefaultLanguage(survey)
          );
          result.push(label);
        }
        return result;
      }
    }
    return ["", ""];
  },
};

type FlatDataExportJobContext = JobMobileContext & {
  survey: Survey;
  cycle: string;
  options: DataExportOptions;
  outputFileUri?: string;
};

export class FlatDataExportJob extends JobMobile<FlatDataExportJobContext> {
  private tempFolderUri?: string;
  private nodeDefsToExport?: any;
  headersByNodeDefUuid: any;

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

    this.nodeDefsToExport = this.determineNodeDefsToExport();
    this.headersByNodeDefUuid = {};
    this.tempFolderUri = await Files.createTempFolder();

    await this.createDataExportFiles();

    const recordSummaries = await RecordService.fetchRecords({
      survey,
      onlyLocal: false,
    });

    this.summary.total = recordSummaries.length;

    for (const recordSummary of recordSummaries) {
      await this.exportRecord({
        recordSummary,
      });
      this.incrementProcessedItems();
    }
  }

  private async createDataExportFiles() {
    const { survey } = this.context;
    let index = 0;
    for (const nodeDef of this.nodeDefsToExport) {
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
      this.headersByNodeDefUuid[nodeDef.uuid] = headers;
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
    const { survey, cycle, options } = this.context;

    const record = await RecordService.fetchRecord({
      survey,
      recordId: recordSummary.id,
    });

    let nodeDefToExportIndex = 0;
    for (const nodeDef of this.nodeDefsToExport) {
      const csvRows = [];
      if (NodeDefs.isAttribute(nodeDef)) {
        // exporting multiple attribute
      } else {
        const descendantDefs = Surveys.getDescendantsInSingleEntities({
          survey,
          cycle,
          nodeDef,
        });
        const nodes = Records.getNodesByDefUuid(nodeDef.uuid)(record);
        for (const node of nodes) {
          const csvRowData = [];
          for (const nodeDefDescendant of descendantDefs) {
            const nodeDescendant = Records.getDescendant({
              record,
              node,
              nodeDefDescendant,
            });
            const nodeRowData = this.extractRowNodeData({
              record,
              node: nodeDescendant,
              nodeDef: nodeDefDescendant,
            });
            csvRowData.push(...nodeRowData);
          }
          csvRows.push(csvRowData);
        }
      }
      const fileName = FlatDataFiles.getFileName({
        nodeDef,
        index: nodeDefToExportIndex,
        extension: "csv",
      });
      const tempFileUri = Files.path(this.tempFolderUri, fileName);
      const headers = this.headersByNodeDefUuid[nodeDef.uuid];
      await FlatDataWriter.appendCsvRows({
        fileUri: tempFileUri,
        headers,
        rows: csvRows,
      });
      nodeDefToExportIndex += 1;
    }
  }

  private extractRowNodeData({
    record,
    node,
    nodeDef,
  }: {
    record: ArenaRecord;
    node: ArenaRecordNode;
    nodeDef: NodeDef<any>;
  }): any[] {
    const { survey, cycle, options } = this.context;
    const nodeValueExtractor =
      rowDataExtractorByNodeDefType[NodeDefs.getType(nodeDef)];

    if (nodeValueExtractor) {
      return nodeValueExtractor({
        survey,
        cycle,
        record,
        node,
        nodeDef,
        options,
      });
    }
    const { value } = node;

    // default extractor
    const valueFormatted = NodeValueFormatter.format({
      survey,
      cycle,
      node,
      nodeDef,
      value,
    });
    return [valueFormatted];
  }

  protected override async onEnd(): Promise<void> {
    await super.onEnd();
    const { survey } = this.context;
    const surveyName = Surveys.getName(survey);
    const timestamp = Dates.nowFormattedForExpression();
    const outputFileName = `arena-mobile-data-export-${surveyName}-${timestamp}.zip`;
    const outputFileUri = Files.path(Files.cacheDirectory, outputFileName);
    await Files.zip(this.tempFolderUri, outputFileUri);

    this.context.outputFileUri = outputFileUri;
  }
}
