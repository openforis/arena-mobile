import { DOMParser, Element, onErrorStopParsing } from "@xmldom/xmldom";

import type { LatLng } from "model/LocationPoint";

export type MapLayerFileGeometries = {
  points: { name?: string; coordinate: LatLng }[];
  lines: { name?: string; coordinates: LatLng[] }[];
  polygons: { name?: string; coordinates: LatLng[]; holes: LatLng[][] }[];
};

const createEmptyGeometries = (): MapLayerFileGeometries => ({
  points: [],
  lines: [],
  polygons: [],
});

const asArray = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [];

// positions are [longitude, latitude] in WGS84 both in GeoJSON and KML
const toLatLng = (position: unknown): LatLng | null => {
  if (!Array.isArray(position)) return null;
  const [longitude, latitude] = position;
  return Number.isFinite(longitude) && Number.isFinite(latitude)
    ? { latitude, longitude }
    : null;
};

const toLatLngs = (positions: unknown): LatLng[] =>
  asArray(positions)
    .map(toLatLng)
    .filter((coordinate): coordinate is LatLng => !!coordinate);

const addLine = (
  result: MapLayerFileGeometries,
  name: string | undefined,
  coordinates: LatLng[],
) => {
  if (coordinates.length > 1) result.lines.push({ name, coordinates });
};

const addPolygon = (
  result: MapLayerFileGeometries,
  name: string | undefined,
  rings: LatLng[][],
) => {
  const [outerRing, ...innerRings] = rings;
  if (!outerRing || outerRing.length < 3) return;
  result.polygons.push({
    name,
    coordinates: outerRing,
    holes: innerRings.filter((ring) => ring.length >= 3),
  });
};

const addGeoJsonGeometry = (
  result: MapLayerFileGeometries,
  geometry: any,
  name?: string,
) => {
  const coordinates = geometry?.coordinates;
  switch (geometry?.type) {
    case "Point": {
      const coordinate = toLatLng(coordinates);
      if (coordinate) result.points.push({ name, coordinate });
      break;
    }
    case "MultiPoint":
      for (const coordinate of toLatLngs(coordinates)) {
        result.points.push({ name, coordinate });
      }
      break;
    case "LineString":
      addLine(result, name, toLatLngs(coordinates));
      break;
    case "MultiLineString":
      for (const line of asArray(coordinates)) {
        addLine(result, name, toLatLngs(line));
      }
      break;
    case "Polygon":
      addPolygon(result, name, asArray(coordinates).map(toLatLngs));
      break;
    case "MultiPolygon":
      for (const rings of asArray(coordinates)) {
        addPolygon(result, name, asArray(rings).map(toLatLngs));
      }
      break;
    case "GeometryCollection":
      for (const child of asArray(geometry.geometries)) {
        addGeoJsonGeometry(result, child, name);
      }
      break;
  }
};

const getGeoJsonFeatureName = (properties: any): string | undefined => {
  const name = properties?.name ?? properties?.Name ?? properties?.NAME;
  return name === null || name === undefined ? undefined : String(name);
};

// FeatureCollection, Feature or bare geometry
const parseGeoJson = (geoJson: any): MapLayerFileGeometries => {
  const result = createEmptyGeometries();
  const items =
    geoJson?.type === "FeatureCollection"
      ? asArray(geoJson.features)
      : [geoJson];
  for (const item of items as any[]) {
    if (item?.type === "Feature") {
      addGeoJsonGeometry(
        result,
        item.geometry,
        getGeoJsonFeatureName(item.properties),
      );
    } else {
      addGeoJsonGeometry(result, item);
    }
  }
  return result;
};

// matched by local name: KML files can use a namespace prefix or no namespace at all
const getDescendants = (element: Element, localName: string): Element[] =>
  Array.from(element.getElementsByTagNameNS("*", localName));

const getChild = (element: Element, localName: string): Element | undefined =>
  Array.from(element.childNodes).find(
    (node): node is Element =>
      node.nodeType === node.ELEMENT_NODE &&
      (node as Element).localName === localName,
  );

// "lon,lat[,alt] lon,lat[,alt] ..."
const parseKmlCoordinates = (element: Element | undefined): LatLng[] => {
  const coordinatesEl = element
    ? getDescendants(element, "coordinates")[0]
    : undefined;
  const text = coordinatesEl?.textContent?.trim() ?? "";
  if (!text) return [];
  return toLatLngs(
    text
      .replaceAll(/\s*,\s*/g, ",")
      .split(/\s+/)
      .map((tuple) => tuple.split(",").map(Number)),
  );
};

const parseKml = (text: string): MapLayerFileGeometries => {
  const doc = new DOMParser({ onError: onErrorStopParsing }).parseFromString(
    text,
    "text/xml",
  );
  const result = createEmptyGeometries();
  for (const placemark of getDescendants(doc.documentElement!, "Placemark")) {
    const name = getChild(placemark, "name")?.textContent?.trim() || undefined;
    for (const pointEl of getDescendants(placemark, "Point")) {
      const coordinate = parseKmlCoordinates(pointEl)[0];
      if (coordinate) result.points.push({ name, coordinate });
    }
    for (const lineEl of getDescendants(placemark, "LineString")) {
      addLine(result, name, parseKmlCoordinates(lineEl));
    }
    for (const polygonEl of getDescendants(placemark, "Polygon")) {
      const outerRing = parseKmlCoordinates(
        getChild(polygonEl, "outerBoundaryIs"),
      );
      const innerRings = getDescendants(polygonEl, "innerBoundaryIs").map(
        parseKmlCoordinates,
      );
      addPolygon(result, name, [outerRing, ...innerRings]);
    }
  }
  return result;
};

const mergeGeometries = (
  items: MapLayerFileGeometries[],
): MapLayerFileGeometries => ({
  points: items.flatMap((item) => item.points),
  lines: items.flatMap((item) => item.lines),
  polygons: items.flatMap((item) => item.polygons),
});

export const MapLayerFileParser = {
  parseGeoJson,
  parseKml,
  mergeGeometries,
};
