import {
  NodeDef,
  NodeDefs,
  NodeDefType,
  Record as ArenaRecord,
  Survey,
  Surveys,
} from "@openforis/arena-core";

export type TrackPoint = {
  latitude: number;
  longitude: number;
  altitude?: number | null;
  accuracy?: number | null;
  // epoch millis
  time: number;
};

export type TrackSegment = TrackPoint[];

export type TrackFeature = {
  type: "Feature";
  properties: {
    startTime: string;
    endTime: string;
    length: number;
    pointsCount: number;
    // parallel to geometry.coordinates
    coordTimes: string[][];
    accuracies: (number | null)[][];
  };
  geometry: {
    type: "MultiLineString";
    coordinates: number[][][];
  };
};

const EARTH_MEAN_RADIUS_METERS = 6371008.8;
// faster than this (m/s) is considered a GPS jump
const defaultMaxSpeed = 50;
// a GeoJSON LineString needs at least 2 positions
const minPointsPerSegment = 2;

const lineGeometryTypes = new Set(["LineString", "MultiLineString"]);

// TODO replace with NodeDefs.isPositionTracking once available in arena-core
const isPositionTrackingNodeDef = (nodeDef: NodeDef<any> | null | undefined) =>
  nodeDef?.type === NodeDefType.geo &&
  Boolean((nodeDef.props as any)?.positionTracking);

const isTrackableNodeDef = (nodeDef: NodeDef<any> | null | undefined) =>
  !!nodeDef &&
  isPositionTrackingNodeDef(nodeDef) &&
  NodeDefs.isSingle(nodeDef) &&
  !NodeDefs.isReadOnly(nodeDef);

const getTrackableNodeDefs = (survey: Survey): NodeDef<any>[] =>
  Surveys.getNodeDefsArray(survey).filter(isTrackableNodeDef);

const isInSingleEntitiesOnly = ({
  survey,
  nodeDef,
}: {
  survey: Survey;
  nodeDef: NodeDef<any>;
}): boolean => {
  let parentDef = Surveys.getNodeDefParent({ survey, nodeDef });
  while (parentDef) {
    if (!NodeDefs.isRoot(parentDef) && NodeDefs.isMultiple(parentDef))
      return false;
    parentDef = Surveys.getNodeDefParent({ survey, nodeDef: parentDef });
  }
  return true;
};

// first trackable attribute (in survey order) in the root entity or in its single entities
const findAutoStartNode = ({
  survey,
  record,
}: {
  survey: Survey;
  record: ArenaRecord;
}) => {
  const nodes = Object.values(record.nodes ?? {});
  for (const nodeDef of getTrackableNodeDefs(survey)) {
    if (!isInSingleEntitiesOnly({ survey, nodeDef })) continue;
    const node = nodes.find((n) => n.nodeDefUuid === nodeDef.uuid);
    if (node) return node;
  }
  return null;
};

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

// haversine distance in meters
const distance = (
  a: Pick<TrackPoint, "latitude" | "longitude">,
  b: Pick<TrackPoint, "latitude" | "longitude">,
): number => {
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.latitude)) *
      Math.cos(toRadians(b.latitude)) *
      Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_MEAN_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(h)));
};

const computeSegmentLength = (segment: TrackSegment): number => {
  let length = 0;
  for (let i = 1; i < segment.length; i++) {
    length += distance(segment[i - 1]!, segment[i]!);
  }
  return length;
};

const computeLength = (segments: TrackSegment[]): number =>
  segments.reduce((acc, segment) => acc + computeSegmentLength(segment), 0);

const countPoints = (segments: TrackSegment[]): number =>
  segments.reduce((acc, segment) => acc + segment.length, 0);

export enum TrackPointRejectReason {
  lowAccuracy = "lowAccuracy",
  tooClose = "tooClose",
  jump = "jump",
}

const evaluatePoint = ({
  point,
  lastPoint,
  accuracyThreshold,
  minDistance,
  maxSpeed = defaultMaxSpeed,
}: {
  point: TrackPoint;
  lastPoint: TrackPoint | null | undefined;
  accuracyThreshold: number;
  minDistance: number;
  maxSpeed?: number;
}): TrackPointRejectReason | null => {
  const { accuracy } = point;
  if (accuracy !== null && accuracy !== undefined && accuracy > accuracyThreshold) {
    return TrackPointRejectReason.lowAccuracy;
  }
  if (!lastPoint) return null;

  const dist = distance(lastPoint, point);
  if (dist < minDistance) return TrackPointRejectReason.tooClose;

  const elapsedSeconds = (point.time - lastPoint.time) / 1000;
  if (elapsedSeconds > 0 && dist / elapsedSeconds > maxSpeed) {
    return TrackPointRejectReason.jump;
  }
  return null;
};

const toIsoString = (time: number) => new Date(time).toISOString();

const toPosition = ({ longitude, latitude, altitude }: TrackPoint): number[] =>
  altitude === null || altitude === undefined
    ? [longitude, latitude]
    : [longitude, latitude, altitude];

const toFeature = (segments: TrackSegment[]): TrackFeature | null => {
  const validSegments = segments.filter(
    (segment) => segment.length >= minPointsPerSegment,
  );
  if (validSegments.length === 0) return null;

  const firstPoint = validSegments[0]![0]!;
  const lastPoint = validSegments.at(-1)!.at(-1)!;

  return {
    type: "Feature",
    properties: {
      startTime: toIsoString(firstPoint.time),
      endTime: toIsoString(lastPoint.time),
      length: Math.round(computeLength(validSegments) * 10) / 10,
      pointsCount: countPoints(validSegments),
      coordTimes: validSegments.map((segment) =>
        segment.map((point) => toIsoString(point.time)),
      ),
      accuracies: validSegments.map((segment) =>
        segment.map((point) => point.accuracy ?? null),
      ),
    },
    geometry: {
      type: "MultiLineString",
      coordinates: validSegments.map((segment) => segment.map(toPosition)),
    },
  };
};

const isTrackValue = (value: any): boolean =>
  lineGeometryTypes.has(value?.geometry?.type);

const extractLineCoordinates = (value: any): number[][][] => {
  const geometry = value?.geometry;
  if (!geometry || !Array.isArray(geometry.coordinates)) return [];
  if (geometry.type === "LineString") return [geometry.coordinates];
  if (geometry.type === "MultiLineString") return geometry.coordinates;
  return [];
};

const fromFeature = (value: any): TrackSegment[] => {
  const lines = extractLineCoordinates(value);
  const coordTimes = value?.properties?.coordTimes;
  const accuracies = value?.properties?.accuracies;
  // LineString values have flat coordTimes/accuracies
  const isSingleLine = value?.geometry?.type === "LineString";
  return lines.map((line, lineIndex) => {
    const lineTimes = isSingleLine ? coordTimes : coordTimes?.[lineIndex];
    const lineAccuracies = isSingleLine ? accuracies : accuracies?.[lineIndex];
    return line
      .filter((position) => Array.isArray(position) && position.length >= 2)
      .map((position, pointIndex) => {
        const [longitude, latitude, altitude] = position;
        const timeString = lineTimes?.[pointIndex];
        const time = timeString ? Date.parse(timeString) : Number.NaN;
        return {
          latitude: latitude!,
          longitude: longitude!,
          altitude: altitude ?? null,
          accuracy: lineAccuracies?.[pointIndex] ?? null,
          time: Number.isNaN(time) ? 0 : time,
        };
      });
  });
};

const formatLength = (meters: number): string =>
  meters < 1000
    ? `${Math.round(meters)} m`
    : `${(meters / 1000).toFixed(2)} km`;

export const PositionTracks = {
  isPositionTrackingNodeDef,
  isTrackableNodeDef,
  getTrackableNodeDefs,
  findAutoStartNode,
  distance,
  computeLength,
  countPoints,
  evaluatePoint,
  toFeature,
  fromFeature,
  isTrackValue,
  extractLineCoordinates,
  formatLength,
};
