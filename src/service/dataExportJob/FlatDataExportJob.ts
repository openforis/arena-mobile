import {
  ArenaRecord,
  ArenaRecordNode,
  Arrays,
  CategoryItems,
  DataExportOptions,
  DataQuery,
  DataQueryMode,
  Dates,
  FlatDataExportModel,
  FlatDataFiles,
  NodeDef,
  NodeDefCoordinate,
  NodeDefs,
  NodeDefType,
  NodeValueFormatter,
  NodeValues,
  Objects,
  Records,
  Survey,
  Surveys,
  Taxa,
  Taxon,
} from "@openforis/arena-core";
import { ArenaMobileRecord } from "model/ArenaMobileRecord";

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
  node: ArenaRecordNode | null | undefined;
  nodeDef: NodeDef<any>;
  options: DataExportOptions;
}) => (string | null | undefined)[];

const extractCategoryItem = ({
  survey,
  node,
}: {
  survey: Survey;
  node: ArenaRecordNode;
}) => {
  if (Objects.isNotEmpty(node?.value)) {
    const itemUuid = NodeValues.getItemUuid(node);
    if (itemUuid) {
      return Surveys.getCategoryItemByUuid({ survey, itemUuid });
    }
  }
  return null;
};

const extractTaxon = ({
  survey,
  node,
}: {
  survey: Survey;
  node: ArenaRecordNode;
}) => {
  if (Objects.isNotEmpty(node?.value)) {
    const taxonUuid = NodeValues.getValueTaxonUuid(node);
    if (taxonUuid) {
      return Surveys.getTaxonByUuid({ survey, taxonUuid });
    }
  }
  return null;
};

const extractScientificName = ({
  taxon,
  node,
}: {
  taxon: Taxon;
  node: ArenaRecordNode;
}): string => {
  const taxonScientificName = Taxa.getScientificName(taxon);
  if (Taxa.isUnknownOrUnlisted(taxon)) {
    const nodeScientificName = NodeValues.getScientificName(node);
    return nodeScientificName ?? taxonScientificName;
  }
  return taxonScientificName;
};

const extractVernacularName = ({
  taxon,
  node,
}: {
  taxon: Taxon;
  node: ArenaRecordNode;
}): string | undefined => {
  const vernacularNameUuid = NodeValues.getVernacularNameUuid(node);
  if (vernacularNameUuid) {
    const { vernacularName, vernacularLang } =
      Taxa.getVernacularNameAndLang(vernacularNameUuid)(taxon);
    return vernacularName ? `${vernacularName} (${vernacularLang})` : undefined;
  }
  if (Taxa.isUnknownOrUnlisted(taxon)) {
    return NodeValues.getVernacularName(node);
  }
  return undefined;
};

const rowDataExtractorByNodeDefType: Partial<
  Record<NodeDefType, RowDataExtractor>
> = {
  [NodeDefType.code]: ({ survey, node: nodeParam, options }) => {
    if (Objects.isEmpty(nodeParam?.value)) {
      return [null, null];
    }
    const node = nodeParam!;
    const item = extractCategoryItem({ survey, node });
    if (!item) {
      return [null, null];
    }
    const result = [CategoryItems.getCode(item)];
    if (options.includeCategoryItemsLabels) {
      const lang = Surveys.getDefaultLanguage(survey);
      const label = CategoryItems.getLabel(item, lang);
      result.push(label);
    }
    return result;
  },
  [NodeDefType.coordinate]: ({ node, nodeDef }) => {
    const additionalFields = NodeDefs.getCoordinateAdditionalFields(
      nodeDef as NodeDefCoordinate
    );
    const totalFieldsCount = 4 + additionalFields.length;
    const value = node?.value;
    if (Objects.isEmpty(value)) {
      return Arrays.fromNumberOfElements(totalFieldsCount).map(() => null);
    }
    const { x, y, srs } = value;
    return [x, y, srs, ...additionalFields.map((field) => value[field])];
  },
  [NodeDefType.date]: ({ node: nodeParam }) => {
    if (Objects.isEmpty(nodeParam?.value)) {
      return [null];
    }
    const node = nodeParam!;
    const [year, month, day] = [
      NodeValues.getDateYear(node),
      NodeValues.getDateMonth(node),
      NodeValues.getDateDay(node),
    ];
    return Dates.isValidDate(year, month, day)
      ? [`${year}-${month}-${day}`]
      : [null];
  },
  [NodeDefType.taxon]: ({ survey, node: nodeParam, options }) => {
    const { includeTaxonScientificName } = options;
    const value = nodeParam?.value;
    if (Objects.isEmpty(value)) {
      const emptyFieldsCount = includeTaxonScientificName ? 3 : 1;
      return Arrays.fromNumberOfElements(emptyFieldsCount).map(() => null);
    }
    const node = nodeParam!;
    const taxon = extractTaxon({ survey, node });
    if (!taxon) {
      const emptyFieldsCount = includeTaxonScientificName ? 3 : 1;
      return Arrays.fromNumberOfElements(emptyFieldsCount).map(() => null);
    }
    const code = Taxa.getCode(taxon);
    if (includeTaxonScientificName) {
      const scientificName = extractScientificName({ taxon, node });
      const vernacularName = extractVernacularName({ taxon, node });
      return [code, scientificName, vernacularName];
    }
    return [code];
  },
  [NodeDefType.time]: ({ node: nodeParam }) => {
    if (Objects.isEmpty(nodeParam?.value)) {
      return [null];
    }
    const node = nodeParam!;
    const [hour, minute] = [
      NodeValues.getTimeHour(node),
      NodeValues.getTimeMinute(node),
    ];
    return Dates.isValidTime(hour, minute) ? [`${hour}:${minute}`] : [null];
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
  private dataExportModelByNodeDefUuid: Record<string, FlatDataExportModel> =
    {};

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

  private async createDataExportFiles() {
    const { survey, cycle } = this.context;
    let index = 0;
    for (const nodeDef of this.nodeDefsToExport) {
      const dataExportModel = new FlatDataExportModel({
        survey,
        cycle,
        nodeDefContext: nodeDef,
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
      const csvRows = [];
      if (NodeDefs.isAttribute(nodeDef)) {
        // exporting multiple attribute
      } else {
        csvRows.push(...this.exportRecordEntities({ nodeDef, record }));
      }
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
    await this.generateOutputFile();
  }

  private async generateOutputFile() {
    const { survey } = this.context;
    const surveyName = Surveys.getName(survey);
    const timestamp = Dates.nowFormattedForExpression();
    const outputFileName = `arena-mobile-data-export-${surveyName}-${timestamp}.zip`;
    const outputFileUri = Files.path(Files.cacheDirectory, outputFileName);
    await Files.zip(this.tempFolderUri, outputFileUri);
  }

  private exportRecordEntities({
    nodeDef,
    record,
  }: {
    nodeDef: NodeDef<any>;
    record: ArenaMobileRecord;
  }): any[] {
    const { survey, cycle, options } = this.context;
    const { addCycle, includeAncestorAttributes } = options;

    const dataExportModel = this.dataExportModelByNodeDefUuid[nodeDef.uuid]!;
    const csvRowsData = [];

    const nodes = Records.getNodesByDefUuid(nodeDef.uuid)(record);
    for (const node of nodes) {
      const csvRowData = [];
      if (addCycle) {
        csvRowData.push(cycle);
      }
      // ancestor (or key) attributes
      Surveys.visitAncestorsAndSelfNodeDef({
        survey,
        nodeDef,
        visitor: (nodeDefAncestor) => {
          const ancestorNode = Records.getAncestor({
            record,
            node,
            ancestorDefUuid: nodeDefAncestor.uuid,
          })!;
          const ancestorNodesRowValues = [];
          const ancestorAttributeDefsConsidered =
            includeAncestorAttributes || nodeDefAncestor === nodeDef
              ? dataExportModel.extractAncestorAttributeDefs(nodeDefAncestor)
              : Surveys.getNodeDefKeys({
                  survey,
                  cycle,
                  nodeDef: nodeDefAncestor,
                });
          for (const ancestorAttrDef of ancestorAttributeDefsConsidered) {
            const ancestorAttributeNode = Records.getDescendant({
              record,
              node: ancestorNode,
              nodeDefDescendant: ancestorAttrDef,
            });
            const ancestorNodeRowValues = this.extractRowNodeData({
              record,
              node: ancestorAttributeNode,
              nodeDef: ancestorAttrDef,
            });
            ancestorNodesRowValues.push(...ancestorNodeRowValues);
          }
          csvRowData.unshift(...ancestorNodesRowValues);
        },
      });

      csvRowsData.push(csvRowData);
    }
    return csvRowsData;
  }

  private extractRowNodeData({
    record,
    node,
    nodeDef,
  }: {
    record: ArenaRecord;
    node: ArenaRecordNode | null | undefined;
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
    const value = node?.value;
    if (Objects.isEmpty(value)) {
      return [""];
    }
    // default extractor
    const valueFormatted = NodeValueFormatter.format({
      survey,
      cycle,
      node: node!,
      nodeDef,
      value,
    });
    return [valueFormatted];
  }

  // protected override cleanup(): Promise<void> {
  //   return Files.del(this.tempFolderUri);
  // }
}
