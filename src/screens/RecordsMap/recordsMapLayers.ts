import {
  CategoryItem,
  CategoryItems,
  LanguageCode,
  NodeDef,
  NodeDefCode,
  NodeDefs,
  NodeDefType,
  Objects,
  Point,
  Points,
  SRSIndex,
  Survey,
  Surveys,
} from "@openforis/arena-core";

import { SurveyDefs } from "model/utils/SurveyDefs";

const latLongSrsCode = "4326";

export enum RecordsMapLayerType {
  samplingPoints = "samplingPoints",
  coordinateAttribute = "coordinateAttribute",
}

export type RecordsMapLayer = {
  key: string;
  type: RecordsMapLayerType;
  color: string;
  // sampling point data category level (samplingPoints layers only)
  levelIndex?: number;
  // coordinate attribute def (coordinateAttribute layers only)
  nodeDefUuid?: string;
};

export type RecordsMapPointProperties = {
  key: string;
  layerKey: string;
  // item codes (sampling points) or record key values (coordinate attributes)
  label: string;
  recordUuids: string[];
  visited?: boolean;
  // location in lat/long (EPSG:4326), used to open the point in other map apps
  point: Point;
};

export type RecordsMapPointFeature = {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: RecordsMapPointProperties;
};

export type RecordSummaryForMap = {
  uuid: string;
  cycle?: string;
  keysObj?: Record<string, any>;
};

const layerColors = [
  "#1e88e5",
  "#8e24aa",
  "#f4511e",
  "#00897b",
  "#6d4c41",
  "#3949ab",
  "#c0ca33",
  "#d81b60",
];

export const visitedSamplingPointColor = "#43a047";
export const notVisitedSamplingPointColor = "#fdd835";

const createPointFeature = ({
  point,
  properties,
}: {
  point: Point;
  properties: Omit<RecordsMapPointProperties, "point">;
}): RecordsMapPointFeature | null => {
  const longitude = Number(point.x);
  const latitude = Number(point.y);
  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return null;
  return {
    type: "Feature",
    geometry: { type: "Point", coordinates: [longitude, latitude] },
    properties: {
      ...properties,
      point: { x: longitude, y: latitude, srs: latLongSrsCode },
    },
  };
};

const toLatLong = ({
  point,
  srsIndex,
}: {
  point: Point | null;
  srsIndex: SRSIndex | undefined;
}): Point | null => {
  if (!point || !srsIndex) return null;
  try {
    return Points.toLatLong(point, srsIndex);
  } catch {
    return null;
  }
};

export const getSamplingPointDataCategory = (survey: Survey) =>
  SurveyDefs.getSamplingPointDataCategoryWithLocation(survey);

const getSamplingPointLevelIndexes = (survey: Survey): number[] => {
  const category = getSamplingPointDataCategory(survey);
  if (!category) return [];
  return (
    Object.entries(category.levels ?? {})
      // levels are indexed by their index
      .map(([key, level]) => {
        const keyIndex = Number(key);
        return Number.isInteger(keyIndex) ? keyIndex : (level.index ?? 0);
      })
      .sort((indexA, indexB) => indexA - indexB)
  );
};

const getCoordinateAttributeDefs = ({
  survey,
  cycle,
}: {
  survey: Survey;
  cycle: string;
}): NodeDef<any>[] =>
  Surveys.getNodeDefsArray(survey).filter(
    (nodeDef) =>
      nodeDef.type === NodeDefType.coordinate &&
      !NodeDefs.isAnalysis(nodeDef) &&
      NodeDefs.isInCycle(cycle)(nodeDef),
  );

export const getAvailableLayers = ({
  survey,
  cycle,
}: {
  survey: Survey;
  cycle: string;
}): RecordsMapLayer[] => {
  const samplingPointLayers = getSamplingPointLevelIndexes(survey).map(
    (levelIndex) => ({
      key: `${RecordsMapLayerType.samplingPoints}_${levelIndex}`,
      type: RecordsMapLayerType.samplingPoints,
      color: notVisitedSamplingPointColor,
      levelIndex,
    }),
  );
  const coordinateLayers = getCoordinateAttributeDefs({ survey, cycle }).map(
    (nodeDef, index) => ({
      key: `${RecordsMapLayerType.coordinateAttribute}_${nodeDef.uuid}`,
      type: RecordsMapLayerType.coordinateAttribute,
      color: layerColors[index % layerColors.length]!,
      nodeDefUuid: nodeDef.uuid,
    }),
  );
  return [...samplingPointLayers, ...coordinateLayers];
};

// true if the survey has sampling points with location or coordinate attributes to show on the map
export const hasMapLayers = ({
  survey,
  cycle,
}: {
  survey: Survey;
  cycle: string;
}): boolean =>
  !!getSamplingPointDataCategory(survey) ||
  getCoordinateAttributeDefs({ survey, cycle }).length > 0;

// entities containing a code attribute referencing the first level of the sampling point data
const getSamplingPointFirstLevelEntityDefUuids = ({
  survey,
  cycle,
}: {
  survey: Survey;
  cycle: string;
}): Set<string> => {
  const entityDefUuids = new Set<string>();
  for (const nodeDef of Surveys.getNodeDefsArray(survey)) {
    if (
      nodeDef.parentUuid &&
      NodeDefs.isInCycle(cycle)(nodeDef) &&
      SurveyDefs.isCodeAttributeFromSamplingPointData({
        survey,
        nodeDef: nodeDef as NodeDefCode,
      }) &&
      Surveys.getNodeDefCategoryLevelIndex({
        survey,
        nodeDef: nodeDef as NodeDefCode,
      }) === 0
    ) {
      entityDefUuids.add(nodeDef.parentUuid);
    }
  }
  return entityDefUuids;
};

// first sampling point level and the coordinate attributes in the same entity of its code attribute;
// all the coordinate attributes when there are no sampling points with location
export const getDefaultVisibleLayerKeys = ({
  survey,
  cycle,
  layers,
}: {
  survey: Survey;
  cycle: string;
  layers: RecordsMapLayer[];
}): string[] => {
  const firstLevelLayer = layers.find(
    (layer) =>
      layer.type === RecordsMapLayerType.samplingPoints &&
      layer.levelIndex === 0,
  );
  const coordinateLayers = layers.filter(
    (layer) => layer.type === RecordsMapLayerType.coordinateAttribute,
  );
  if (!firstLevelLayer) return coordinateLayers.map((layer) => layer.key);

  const entityDefUuids = getSamplingPointFirstLevelEntityDefUuids({
    survey,
    cycle,
  });
  const associatedCoordinateLayers = coordinateLayers.filter((layer) => {
    const nodeDef = Surveys.getNodeDefByUuid({
      survey,
      uuid: layer.nodeDefUuid!,
    });
    return !!nodeDef.parentUuid && entityDefUuids.has(nodeDef.parentUuid);
  });
  return [firstLevelLayer, ...associatedCoordinateLayers].map(
    (layer) => layer.key,
  );
};

export const getLayerLabel = ({
  survey,
  layer,
  lang,
  t,
}: {
  survey: Survey;
  layer: RecordsMapLayer;
  lang: LanguageCode;
  t: (key: string, params?: any) => string;
}): string => {
  if (layer.type === RecordsMapLayerType.samplingPoints) {
    return t("recordsMap:samplingPointsLayer", {
      level: (layer.levelIndex ?? 0) + 1,
    });
  }
  const nodeDef = Surveys.getNodeDefByUuid({
    survey,
    uuid: layer.nodeDefUuid!,
  });
  const parentDef = Surveys.getNodeDefParent({ survey, nodeDef });
  const label = NodeDefs.getLabelOrName(nodeDef, lang);
  return parentDef && !NodeDefs.isRoot(parentDef)
    ? `${NodeDefs.getLabelOrName(parentDef, lang)} > ${label}`
    : label;
};

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
  srsIndex,
  layer,
  recordUuidsByItemUuid,
}: {
  survey: Survey;
  srsIndex: SRSIndex | undefined;
  layer: RecordsMapLayer;
  recordUuidsByItemUuid: Record<string, string[]>;
}): RecordsMapPointFeature[] => {
  const category = getSamplingPointDataCategory(survey);
  if (!category) return [];
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

export const buildCoordinateAttributeFeatures = ({
  srsIndex,
  layer,
  nodeValues,
  recordLabelByUuid,
}: {
  srsIndex: SRSIndex | undefined;
  layer: RecordsMapLayer;
  nodeValues: { recordUuid: string; nodeDefUuid: string; value: any }[];
  recordLabelByUuid: Record<string, string>;
}): RecordsMapPointFeature[] => {
  const features: RecordsMapPointFeature[] = [];
  let index = 0;
  for (const { recordUuid, nodeDefUuid, value } of nodeValues) {
    if (nodeDefUuid !== layer.nodeDefUuid) continue;
    // records not in the selected cycle or deleted are not in the labels index
    const label = recordLabelByUuid[recordUuid];
    if (label === undefined) continue;
    const point = toLatLong({ point: Points.parse(value), srsIndex });
    if (!point) continue;
    const feature = createPointFeature({
      point,
      properties: {
        key: `${recordUuid}_${index++}`,
        layerKey: layer.key,
        label,
        recordUuids: [recordUuid],
      },
    });
    if (feature) features.push(feature);
  }
  return features;
};
