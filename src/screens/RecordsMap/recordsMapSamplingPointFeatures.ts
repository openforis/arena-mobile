import {
  ArenaCategoryItem,
  CategoryItems,
  ArenaAnyNodeDef,
  ArenaNodeDefCode,
  NodeDefs,
  Objects,
  Points,
  ArenaSurvey,
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
  survey: ArenaSurvey;
  item: ArenaCategoryItem;
}): string[] => {
  const codes: string[] = [];
  let current: ArenaCategoryItem | undefined = item;
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
  survey: ArenaSurvey;
  cycle: string;
}): ArenaNodeDefCode[] =>
  (SurveyDefs.getRootKeyDefs({ survey, cycle }) as ArenaAnyNodeDef[])
    .filter((nodeDef) =>
      SurveyDefs.isCodeAttributeFromSamplingPointData({
        survey,
        nodeDef: nodeDef as ArenaNodeDefCode,
      }),
    )
    .map((nodeDef) => nodeDef as ArenaNodeDefCode)
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
  survey: ArenaSurvey;
  categoryUuid: string;
  value: unknown;
  codePath: string[];
}): ArenaCategoryItem | undefined => {
  if (Objects.isEmpty(value)) return undefined;
  // not null: empty values excluded above
  const valueObj =
    typeof value === "object"
      ? (value as { itemUuid?: string; code?: string })
      : undefined;
  const itemUuid = valueObj ? valueObj.itemUuid : undefined;
  if (itemUuid) return Surveys.getCategoryItemByUuid({ survey, itemUuid });
  const code = valueObj ? valueObj.code : String(value);
  if (Objects.isEmpty(code)) return undefined;
  return Surveys.getCategoryItemByCodePaths({
    survey,
    categoryUuid,
    codePaths: [...codePath, code!],
  });
};

const addRecordToVisitedItems = ({
  survey,
  keyDefs,
  recordSummary,
  recordUuidsByItemUuid,
}: {
  survey: ArenaSurvey;
  keyDefs: ArenaNodeDefCode[];
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
  survey: ArenaSurvey;
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
  survey: ArenaSurvey;
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
