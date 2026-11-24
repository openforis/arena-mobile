import {
  ArenaAreaOfInterest,
  ArenaPoint,
  Points,
  ArenaSRSIndex,
  ArenaSurvey,
  Surveys,
} from "@openforis/arena-core";

import { PositionTracks } from "model/utils/PositionTracks";
import type { MapLayerFileGeometries } from "utils/MapLayerFileParser";

import {
  latLongSrsCode,
  RecordsMapAreaPolygon,
  RecordsMapLayer,
  RecordsMapNodeValue,
  RecordsMapPointFeature,
  RecordsMapPointProperties,
  RecordsMapPreloadedLayerShapes,
  RecordsMapTrackFeature,
} from "./recordsMapLayerTypes";

export const createPointFeature = ({
  point,
  properties,
}: {
  point: ArenaPoint;
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

export const toLatLong = ({
  point,
  srsIndex,
}: {
  point: ArenaPoint | null;
  srsIndex: ArenaSRSIndex;
}): ArenaPoint | null => {
  if (!point) return null;
  try {
    return Points.toLatLong(point, srsIndex);
  } catch {
    return null;
  }
};

export const buildCoordinateAttributeFeatures = ({
  survey,
  layer,
  nodeValues,
  recordLabelByUuid,
}: {
  survey: ArenaSurvey;
  layer: RecordsMapLayer;
  nodeValues: RecordsMapNodeValue[];
  recordLabelByUuid: Record<string, string>;
}): RecordsMapPointFeature[] => {
  const srsIndex = Surveys.getSRSIndex(survey);
  const features: RecordsMapPointFeature[] = [];
  let index = 0;
  for (const { recordUuid, nodeDefUuid, value } of nodeValues) {
    if (nodeDefUuid !== layer.nodeDefUuid) continue;
    // records not in the selected cycle or deleted are not in the labels index
    const label = recordLabelByUuid[recordUuid];
    if (label === undefined) continue;
    const point = toLatLong({
      point: Points.parse(value),
      srsIndex,
    });
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

export const buildTrackFeatures = ({
  layer,
  nodeValues,
  recordLabelByUuid,
}: {
  layer: RecordsMapLayer;
  nodeValues: RecordsMapNodeValue[];
  recordLabelByUuid: Record<string, string>;
}): RecordsMapTrackFeature[] => {
  const features: RecordsMapTrackFeature[] = [];
  let index = 0;
  for (const { recordUuid, nodeDefUuid, value } of nodeValues) {
    if (nodeDefUuid !== layer.nodeDefUuid) continue;
    const label = recordLabelByUuid[recordUuid];
    if (label === undefined) continue;
    const lines = PositionTracks.extractLineCoordinates(value)
      .map(toLatLngs)
      .filter((line) => line.length > 1);
    const start = lines[0]?.[0];
    if (!start) continue;
    features.push({
      key: `${recordUuid}_${index++}`,
      layerKey: layer.key,
      label,
      recordUuid,
      lines,
      point: { x: start.longitude, y: start.latitude, srs: latLongSrsCode },
    });
  }
  return features;
};

// GeoJSON positions are [longitude, latitude]
const toLatLngs = (positions: number[][]) =>
  (Array.isArray(positions) ? positions : [])
    .filter(
      (position) =>
        Array.isArray(position) &&
        Number.isFinite(position[0]) &&
        Number.isFinite(position[1]),
    )
    .map(([longitude, latitude]) => ({
      latitude: latitude!,
      longitude: longitude!,
    }));

// one map polygon (outer ring and holes) for each polygon of the area
export const buildAreaOfInterestPolygons = ({
  layer,
  areaOfInterest,
}: {
  layer: RecordsMapLayer;
  areaOfInterest: ArenaAreaOfInterest;
}): RecordsMapAreaPolygon[] => {
  const polygons =
    areaOfInterest.type === "Polygon"
      ? [areaOfInterest.coordinates]
      : areaOfInterest.coordinates;
  const result: RecordsMapAreaPolygon[] = [];
  polygons.forEach((rings, index) => {
    const [outerRing, ...innerRings] = (Array.isArray(rings) ? rings : []).map(
      toLatLngs,
    );
    if (!outerRing || outerRing.length < 3) return;
    result.push({
      key: `${layer.key}_${index}`,
      coordinates: outerRing,
      holes: innerRings.filter((ring) => ring.length >= 3),
    });
  });
  return result;
};

export const buildPreloadedMapLayerShapes = ({
  layer,
  geometries,
}: {
  layer: RecordsMapLayer;
  geometries: MapLayerFileGeometries;
}): RecordsMapPreloadedLayerShapes => ({
  points: geometries.points.flatMap(({ name, coordinate }, index) => {
    const feature = createPointFeature({
      point: {
        x: coordinate.longitude,
        y: coordinate.latitude,
        srs: latLongSrsCode,
      },
      properties: {
        key: `${layer.key}_${index}`,
        layerKey: layer.key,
        label: name ?? "",
        recordUuids: [],
      },
    });
    return feature ? [feature] : [];
  }),
  lines: geometries.lines.map(({ coordinates }, index) => ({
    key: `${layer.key}_line_${index}`,
    coordinates,
  })),
  polygons: geometries.polygons.map(({ coordinates, holes }, index) => ({
    key: `${layer.key}_polygon_${index}`,
    coordinates,
    holes,
  })),
});
