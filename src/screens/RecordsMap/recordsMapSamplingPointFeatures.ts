import {
  CategoryItem,
  CategoryItems,
  NodeDef,
  NodeDefCode,
  NodeDefs,
  Objects,
  Points,
  Survey,
  Surveys,
} from "@openforis/arena-core";

import { SurveyDefs } from "model/utils/SurveyDefs";

import { createPointFeature, toLatLong } from "./recordsMapGeometryBuilders";
import { getSamplingPointDataCategory } from "./recordsMapLayerDefs";
import {
  RecordsMapLayer,
  RecordsMapPointFeature,
  RecordSummaryForMap,
} from "./recordsMapLayerTypes";

const getItemCodePath = ({
  survey,
  item,
}: {
  survey: Survey;
  item: CategoryItem;
}): string[] => {
  const codes: string[] = [];
  let current: CategoryItem | undefined = item;
  while (current) {
    codes.unshift(CategoryItems.getCode(current));
    current = current.parentUuid
      ? Surveys.getCategoryItemByUuid({ survey, itemUuid: current.parentUuid })
      : undefined;
  }
  return codes;
};

const getSamplingPointRootKeyDefs = ({
  survey,
  cycle,
}: {
  survey: Survey;
  cycle: string;
}): NodeDefCode[] =>
  (SurveyDefs.getRootKeyDefs({ survey, cycle }) as NodeDef<any>[])
    .filter((nodeDef) =>
      SurveyDefs.isCodeAttributeFromSamplingPointData({
        survey,
        nodeDef: nodeDef as NodeDefCode,
      }),
    )
    .map((nodeDef) => nodeDef as NodeDefCode)
    .sort(
      (defA, defB) =>
        Surveys.getNodeDefCategoryLevelIndex({ survey, nodeDef: defA }) -
        Surveys.getNodeDefCategoryLevelIndex({ survey, nodeDef: defB }),
    );

// key values can be stored as { itemUuid } (local records) or as plain codes (remote summaries)
const resolveKeyItem = ({
  survey,
  categoryUuid,
  value,
  codePath,
}: {
  survey: Survey;
  categoryUuid: string;
  value: any;
  codePath: string[];
}): CategoryItem | undefined => {
  if (Objects.isEmpty(value)) return undefined;
  const itemUuid = typeof value === "object" ? value.itemUuid : undefined;
  if (itemUuid) return Surveys.getCategoryItemByUuid({ survey, itemUuid });
  const code = typeof value === "object" ? value.code : String(value);
  if (Objects.isEmpty(code)) return undefined;
  return Surveys.getCategoryItemByCodePaths({
    survey,
    categoryUuid,
    codePaths: [...codePath, code],
  });
};

const addRecordToVisitedItems = ({
  survey,
  keyDefs,
  recordSummary,
  recordUuidsByItemUuid,
}: {
  survey: Survey;
  keyDefs: NodeDefCode[];
  recordSummary: RecordSummaryForMap;
  recordUuidsByItemUuid: Record<string, string[]>;
}) => {
  const codePath: string[] = [];
  for (const keyDef of keyDefs) {
    const item = resolveKeyItem({
      survey,
      categoryUuid: NodeDefs.getCategoryUuid(keyDef)!,
      value: recordSummary.keysObj?.[NodeDefs.getName(keyDef)],
      codePath,
    });
    if (!item) return;
    codePath.push(CategoryItems.getCode(item));
    const recordUuids = (recordUuidsByItemUuid[item.uuid] ??= []);
    if (!recordUuids.includes(recordSummary.uuid)) {
      recordUuids.push(recordSummary.uuid);
    }
  }
};

// sampling point items referenced by the root key attributes of the records (local or remote)
export const getRecordUuidsBySamplingPointItemUuid = ({
  survey,
  cycle,
  recordSummaries,
}: {
  survey: Survey;
  cycle: string;
  recordSummaries: RecordSummaryForMap[];
}): Record<string, string[]> => {
  const keyDefs = getSamplingPointRootKeyDefs({ survey, cycle });
  const recordUuidsByItemUuid: Record<string, string[]> = {};
  if (keyDefs.length === 0) return recordUuidsByItemUuid;
  for (const recordSummary of recordSummaries) {
    addRecordToVisitedItems({
      survey,
      keyDefs,
      recordSummary,
      recordUuidsByItemUuid,
    });
  }
  return recordUuidsByItemUuid;
};

export const buildSamplingPointFeatures = ({
  survey,
  layer,
  recordUuidsByItemUuid,
}: {
  survey: Survey;
  layer: RecordsMapLayer;
  recordUuidsByItemUuid: Record<string, string[]>;
}): RecordsMapPointFeature[] => {
  const category = getSamplingPointDataCategory(survey);
  if (!category) return [];
  const srsIndex = Surveys.getSRSIndex(survey);
  const items = Surveys.getCategoryItemsInLevel({
    survey,
    categoryUuid: category.uuid,
    levelIndex: layer.levelIndex,
  });
  const features: RecordsMapPointFeature[] = [];
  for (const item of items) {
    const location =
      item.props?.extra?.[SurveyDefs.samplingPointDataLocationPropName];
    if (!location) continue;
    const point = toLatLong({ point: Points.parse(location), srsIndex });
    if (!point) continue;
    const recordUuids = recordUuidsByItemUuid[item.uuid] ?? [];
    const feature = createPointFeature({
      point,
      properties: {
        key: item.uuid,
        layerKey: layer.key,
        label: getItemCodePath({ survey, item }).join(" - "),
        recordUuids,
        visited: recordUuids.length > 0,
      },
    });
    if (feature) features.push(feature);
  }
  return features;
};
