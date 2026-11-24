import type { ArenaPoint } from "@openforis/arena-core";

export const latLongSrsCode = "4326";

export enum RecordsMapLayerType {
  samplingPoints = "samplingPoints",
  coordinateAttribute = "coordinateAttribute",
  positionTrack = "positionTrack",
  areaOfInterest = "areaOfInterest",
  preloadedMapLayer = "preloadedMapLayer",
}

export type RecordsMapLayer = {
  key: string;
  type: RecordsMapLayerType;
  color: string;
  // sampling point data category level (samplingPoints layers only)
  levelIndex?: number;
  // attribute def (coordinateAttribute and positionTrack layers only)
  nodeDefUuid?: string;
  // survey area of interest (areaOfInterest layers only)
  areaName?: string;
  // survey file (preloadedMapLayer layers only)
  fileUuid?: string;
};

export type RecordsMapPointProperties = {
  key: string;
  layerKey: string;
  // item codes (sampling points) or record key values (coordinate attributes)
  label: string;
  recordUuids: string[];
  visited?: boolean;
  // location in lat/long (EPSG:4326), used to open the point in other map apps
  point: ArenaPoint;
};

export type RecordsMapPointFeature = {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: RecordsMapPointProperties;
};

export type RecordsMapTrackFeature = {
  key: string;
  layerKey: string;
  label: string;
  recordUuid: string;
  // one line per track segment
  lines: { latitude: number; longitude: number }[][];
  // track start, used to open the track in other map apps
  point: ArenaPoint;
};

export type RecordsMapAreaPolygon = {
  key: string;
  coordinates: { latitude: number; longitude: number }[];
  holes: { latitude: number; longitude: number }[][];
};

export type RecordsMapLine = {
  key: string;
  coordinates: { latitude: number; longitude: number }[];
};

export type RecordsMapPreloadedLayerShapes = {
  points: RecordsMapPointFeature[];
  lines: RecordsMapLine[];
  polygons: RecordsMapAreaPolygon[];
};

export type RecordSummaryForMap = {
  uuid: string;
  cycle?: string;
  keysObj?: Record<string, unknown>;
};

// value of a node (attribute) of a record stored in the device
export type RecordsMapNodeValue = {
  recordUuid: string;
  nodeDefUuid: string;
  value: unknown;
};
