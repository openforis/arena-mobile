import {
  ArenaRecordNode,
  Arrays,
  CategoryItems,
  DataExportOptions,
  Dates,
  NodeDef,
  NodeDefCoordinate,
  NodeDefs,
  NodeDefType,
  NodeValueFormatter,
  NodeValues,
  Objects,
  Strings,
  Survey,
  Surveys,
  Taxa,
  Taxon,
} from "@openforis/arena-core";
import { ArenaMobileRecord } from "model/ArenaMobileRecord";

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
    const { includeCategoryItemsLabels } = options;
    const totalFieldsCount = includeCategoryItemsLabels ? 2 : 1;
    if (Objects.isEmpty(nodeParam?.value)) {
      return Arrays.fromNumberOfElements(totalFieldsCount).map(() => null);
    }
    const node = nodeParam!;
    const item = extractCategoryItem({ survey, node });
    if (!item) {
      return Arrays.fromNumberOfElements(totalFieldsCount).map(() => null);
    }
    const result = [CategoryItems.getCode(item)];
    if (includeCategoryItemsLabels) {
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
    const srsText = Strings.prependIfMissing("EPSG:")(srs);
    return [x, y, srsText, ...additionalFields.map((field) => value[field])];
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
  [NodeDefType.file]: ({ node: nodeParam, nodeDef }) => {
    if (Objects.isEmpty(nodeParam?.value)) {
      return [null];
    }
    const node = nodeParam!;
    const fileNameExpression = NodeDefs.getFileNameExpression(nodeDef);
    const fileUuid = NodeValues.getFileUuid(node);
    const fileName = fileNameExpression
      ? NodeValues.getFileNameCalculated(node)
      : NodeValues.getFileName(node);
    return [fileUuid, fileName];
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

export const extractRowNodeData = ({
  survey,
  cycle,
  record,
  node,
  nodeDef,
  options,
}: {
  survey: Survey;
  cycle: string;
  record: ArenaMobileRecord;
  node: ArenaRecordNode | null | undefined;
  nodeDef: NodeDef<any>;
  options: DataExportOptions;
}): any[] => {
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
};
