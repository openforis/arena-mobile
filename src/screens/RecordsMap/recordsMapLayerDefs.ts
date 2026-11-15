import {
  LanguageCode,
  NodeDef,
  NodeDefCode,
  NodeDefs,
  NodeDefType,
  Survey,
  Surveys,
} from "@openforis/arena-core";

import { PositionTracks } from "model/utils/PositionTracks";
import { SurveyDefs } from "model/utils/SurveyDefs";

import { RecordsMapLayer, RecordsMapLayerType } from "./recordsMapLayerTypes";

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

const getPositionTrackAttributeDefs = ({
  survey,
  cycle,
}: {
  survey: Survey;
  cycle: string;
}): NodeDef<any>[] =>
  Surveys.getNodeDefsArray(survey).filter(
    (nodeDef) =>
      PositionTracks.isPositionTrackingNodeDef(nodeDef) &&
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
  const trackLayers = getPositionTrackAttributeDefs({ survey, cycle }).map(
    (nodeDef, index) => ({
      key: `${RecordsMapLayerType.positionTrack}_${nodeDef.uuid}`,
      type: RecordsMapLayerType.positionTrack,
      color:
        layerColors[(coordinateLayers.length + index) % layerColors.length]!,
      nodeDefUuid: nodeDef.uuid,
    }),
  );
  const colorIndexOffset = coordinateLayers.length + trackLayers.length;
  const areaOfInterestLayers = Surveys.getAreasOfInterest(survey).map(
    ({ name }, index) => ({
      key: `${RecordsMapLayerType.areaOfInterest}_${name}`,
      type: RecordsMapLayerType.areaOfInterest,
      color: layerColors[(colorIndexOffset + index) % layerColors.length]!,
      areaName: name,
    }),
  );
  const preloadedColorIndexOffset =
    colorIndexOffset + areaOfInterestLayers.length;
  const preloadedMapLayers = SurveyDefs.getPreloadedMapLayers(survey).map(
    ({ uuid }, index) => ({
      key: `${RecordsMapLayerType.preloadedMapLayer}_${uuid}`,
      type: RecordsMapLayerType.preloadedMapLayer,
      color:
        layerColors[(preloadedColorIndexOffset + index) % layerColors.length]!,
      fileUuid: uuid,
    }),
  );
  return [
    ...samplingPointLayers,
    ...coordinateLayers,
    ...trackLayers,
    ...areaOfInterestLayers,
    ...preloadedMapLayers,
  ];
};

// true if the survey has sampling points with location, coordinate attributes, tracks, areas of interest or preloaded map layers to show on the map
export const hasMapLayers = ({
  survey,
  cycle,
}: {
  survey: Survey;
  cycle: string;
}): boolean =>
  !!getSamplingPointDataCategory(survey) ||
  getCoordinateAttributeDefs({ survey, cycle }).length > 0 ||
  getPositionTrackAttributeDefs({ survey, cycle }).length > 0 ||
  Surveys.getAreasOfInterest(survey).length > 0 ||
  SurveyDefs.getPreloadedMapLayers(survey).length > 0;

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

const layerGroupTitleKeyByType: Record<RecordsMapLayerType, string> = {
  [RecordsMapLayerType.samplingPoints]: "recordsMap:layerGroup.samplingPoints",
  [RecordsMapLayerType.coordinateAttribute]:
    "recordsMap:layerGroup.coordinateAttributes",
  [RecordsMapLayerType.positionTrack]: "recordsMap:layerGroup.positionTracks",
  [RecordsMapLayerType.areaOfInterest]: "recordsMap:layerGroup.areasOfInterest",
  [RecordsMapLayerType.preloadedMapLayer]:
    "recordsMap:layerGroup.preloadedMapLayers",
};

export type RecordsMapLayerGroup<T> = {
  type: RecordsMapLayerType;
  titleKey: string;
  items: T[];
};

// layers grouped by type, in the order of the layers
export const groupLayerItemsByType = <T extends { layer: RecordsMapLayer }>(
  items: T[],
): RecordsMapLayerGroup<T>[] =>
  items.reduce((groups: RecordsMapLayerGroup<T>[], item) => {
    const { type } = item.layer;
    let group = groups.find((g) => g.type === type);
    if (!group) {
      group = { type, titleKey: layerGroupTitleKeyByType[type], items: [] };
      groups.push(group);
    }
    group.items.push(item);
    return groups;
  }, []);

// inGroup: label shown under the group title, without the layer type prefix
export const getLayerLabel = ({
  survey,
  layer,
  lang,
  t,
  inGroup = false,
}: {
  survey: Survey;
  layer: RecordsMapLayer;
  lang: LanguageCode;
  t: (key: string, params?: any) => string;
  inGroup?: boolean;
}): string => {
  if (layer.type === RecordsMapLayerType.samplingPoints) {
    return t(
      inGroup
        ? "recordsMap:samplingPointsLevel"
        : "recordsMap:samplingPointsLayer",
      { level: (layer.levelIndex ?? 0) + 1 },
    );
  }
  if (layer.type === RecordsMapLayerType.areaOfInterest) {
    const descriptor = Surveys.getAreaOfInterestByName({
      survey,
      name: layer.areaName!,
    });
    const name = descriptor?.labels?.[lang] || layer.areaName!;
    return inGroup ? name : t("recordsMap:areaOfInterestLayer", { name });
  }
  if (layer.type === RecordsMapLayerType.preloadedMapLayer) {
    const file = SurveyDefs.getPreloadedMapLayers(survey).find(
      ({ uuid }) => uuid === layer.fileUuid,
    );
    const name = file?.props.labels?.[lang] || file?.props.name || "";
    return inGroup ? name : t("recordsMap:preloadedMapLayer", { name });
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
