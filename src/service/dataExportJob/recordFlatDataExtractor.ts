import {
  ArenaRecordNode,
  Arrays,
  CategoryItems,
  ArenaFlatDataExportOptions,
  Dates,
  ArenaNodeDef,
  ArenaNodeDefCoordinate,
  NodeDefs,
  NodeDefType,
  RecordNodeValueFormatter,
  RecordNodeValues,
  Objects,
  Strings,
  ArenaSurvey,
  Surveys,
  Taxa,
  ArenaTaxon,
  UniqueFileNamesGenerator,
} from "@openforis/arena-core";
import { ArenaMobileRecord } from "model/ArenaMobileRecord";
import { Files } from "utils";

type RowDataExtractorParams = {
  survey: ArenaSurvey;
  cycle: string;
  record: ArenaMobileRecord;
  node: ArenaRecordNode | null | undefined;
  nodeDef: ArenaNodeDef<any>;
  options: ArenaFlatDataExportOptions;
  uniqueFileNameGenerator: UniqueFileNamesGenerator;
};

type RowDataExtractor = ({
  survey,
  cycle,
  record,
  node,
  nodeDef,
  options,
}: RowDataExtractorParams) => (string | null | undefined)[];

const totalFieldsCountCalculatorByNodeDefType: Partial<
  Record<NodeDefType, (params: RowDataExtractorParams) => number>
> = {
  [NodeDefType.code]: ({ options }) => {
    const { includeCategoryItemsLabels } = options;
    return includeCategoryItemsLabels ? 2 : 1;
  },
  [NodeDefType.coordinate]: ({ nodeDef }) => {
    const additionalFields = NodeDefs.getCoordinateAdditionalFields(
      nodeDef as ArenaNodeDefCoordinate,
    );
    return 3 + additionalFields.length;
  },
  [NodeDefType.file]: () => 2,
  [NodeDefType.taxon]: ({ options }) => {
    const { includeTaxonScientificName } = options;
    return includeTaxonScientificName ? 3 : 1;
  },
};

const generateEmptyFields = (
  params: RowDataExtractorParams,
): (string | null | undefined)[] => {
  const { nodeDef } = params;
  const nodeDefType = NodeDefs.getType(nodeDef);
  const totalFieldsCount =
    totalFieldsCountCalculatorByNodeDefType[nodeDefType]?.(params) ?? 1;
  return emptyFields(totalFieldsCount);
};

const extractCategoryItem = (params: RowDataExtractorParams) => {
  const { survey, node } = params;
  if (Objects.isNotEmpty(node?.value)) {
    const itemUuid = RecordNodeValues.getItemUuid(node!);
    if (itemUuid) {
      return Surveys.getCategoryItemByUuid({ survey, itemUuid });
    }
  }
  return null;
};

const extractTaxon = (params: RowDataExtractorParams) => {
  const { survey, node } = params;
  if (Objects.isNotEmpty(node?.value)) {
    const taxonUuid = RecordNodeValues.getTaxonUuid(node!);
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
  taxon: ArenaTaxon;
  node: ArenaRecordNode;
}): string => {
  const taxonScientificName = Taxa.getScientificName(taxon);
  if (Taxa.isUnknownOrUnlisted(taxon)) {
    const nodeScientificName = RecordNodeValues.getScientificName(node);
    return nodeScientificName ?? taxonScientificName;
  }
  return taxonScientificName;
};

const extractVernacularName = ({
  taxon,
  node,
}: {
  taxon: ArenaTaxon;
  node: ArenaRecordNode;
}): string | undefined => {
  const vernacularNameUuid = RecordNodeValues.getVernacularNameUuid(node);
  if (vernacularNameUuid) {
    const { vernacularName, vernacularLang } =
      Taxa.getVernacularNameAndLang(vernacularNameUuid)(taxon);
    return vernacularName ? `${vernacularName} (${vernacularLang})` : undefined;
  }
  if (Taxa.isUnknownOrUnlisted(taxon)) {
    return RecordNodeValues.getVernacularName(node);
  }
  return undefined;
};

const emptyFields = (emptyFieldsCount: number = 1) =>
  Arrays.fromNumberOfElements(emptyFieldsCount).map(() => null);

const rowDataExtractorByNodeDefType: Partial<
  Record<NodeDefType, RowDataExtractor>
> = {
  [NodeDefType.code]: (params) => {
    const { survey, options } = params;
    const { includeCategoryItemsLabels } = options;
    const item = extractCategoryItem(params);
    if (!item) {
      return generateEmptyFields(params);
    }
    const result = [CategoryItems.getCode(item)];
    if (includeCategoryItemsLabels) {
      const lang = Surveys.getDefaultLanguage(survey);
      const label = CategoryItems.getLabel(item, lang);
      result.push(label);
    }
    return result;
  },
  [NodeDefType.coordinate]: (params) => {
    const { node, nodeDef } = params;
    const additionalFields = NodeDefs.getCoordinateAdditionalFields(
      nodeDef as ArenaNodeDefCoordinate,
    );
    const value = node?.value;
    if (Objects.isEmpty(value)) {
      return generateEmptyFields(params);
    }
    const { x, y, srs } = value;
    const srsText = Strings.prependIfMissing("EPSG:")(srs);
    return [x, y, srsText, ...additionalFields.map((field) => value[field])];
  },
  [NodeDefType.date]: (params) => {
    const { node: nodeParam } = params;
    if (Objects.isEmpty(nodeParam?.value)) {
      return generateEmptyFields(params);
    }
    const node = nodeParam!;
    const [year, month, day] = [
      RecordNodeValues.getDateYear(node),
      RecordNodeValues.getDateMonth(node),
      RecordNodeValues.getDateDay(node),
    ];
    return Dates.isValidDate(year, month, day)
      ? [`${year}-${month}-${day}`]
      : generateEmptyFields(params);
  },
  [NodeDefType.file]: (params) => {
    const { node: nodeParam, nodeDef, uniqueFileNameGenerator } = params;
    if (Objects.isEmpty(nodeParam?.value)) {
      return generateEmptyFields(params);
    }
    const node = nodeParam!;
    const fileNameExpression = NodeDefs.getFileNameExpression(nodeDef);
    const fileUuid = RecordNodeValues.getFileUuid(node)!;
    const fileName = fileNameExpression
      ? RecordNodeValues.getFileNameCalculated(node)
      : RecordNodeValues.getFileName(node);
    // the name becomes a file path in the export, and records can come from other devices or a server
    const uniqueFileName = uniqueFileNameGenerator.generateUniqueFileName(
      fileName ? Files.sanitizeFileName(fileName) : fileUuid,
      fileUuid,
    );
    return [fileUuid, uniqueFileName];
  },
  [NodeDefType.taxon]: (params) => {
    const { node, options } = params;
    const { includeTaxonScientificName } = options;
    const taxon = extractTaxon(params);
    if (!taxon) {
      return generateEmptyFields(params);
    }
    const result: (string | null | undefined)[] = [Taxa.getCode(taxon)];
    if (includeTaxonScientificName) {
      const scientificName = extractScientificName({ taxon, node: node! });
      const vernacularName = extractVernacularName({ taxon, node: node! });
      result.push(scientificName, vernacularName);
    }
    return result;
  },
  [NodeDefType.time]: (params) => {
    const { node: nodeParam } = params;
    if (Objects.isEmpty(nodeParam?.value)) {
      return generateEmptyFields(params);
    }
    const node = nodeParam!;
    const hour = RecordNodeValues.getTimeHour(node);
    const minute = RecordNodeValues.getTimeMinute(node);
    return Dates.isValidTime(hour, minute)
      ? [`${hour}:${minute}:00`]
      : generateEmptyFields(params);
  },
};

export const extractRowNodeData = (params: RowDataExtractorParams): any[] => {
  const { survey, cycle, node, nodeDef } = params;
  const nodeValueExtractor =
    rowDataExtractorByNodeDefType[NodeDefs.getType(nodeDef)];

  if (nodeValueExtractor) {
    return nodeValueExtractor(params);
  }
  const value = node?.value;
  if (Objects.isEmpty(value)) {
    return [""];
  }
  // default extractor
  const valueFormatted = RecordNodeValueFormatter.format({
    survey,
    cycle,
    node: node!,
    nodeDef,
    value,
  });
  return [valueFormatted];
};
