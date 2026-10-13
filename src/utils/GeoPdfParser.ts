import {
  PDFArray,
  PDFDict,
  PDFDocument,
  PDFHexString,
  PDFName,
  PDFNumber,
  PDFObject,
  PDFRef,
  PDFString,
} from "pdf-lib";

import { LatLng } from "model/LocationPoint";

import { Box, Point } from "./GeoPdfTransform";

// Reads the georeferencing of the pages of a geospatial PDF
// (ISO 32000 / Adobe "geospatial PDF": page /VP -> viewport /Measure with /Subtype /GEO).

export type GeoPdfControlPoint = {
  // user space (page points)
  user: Point;
  latLng: LatLng;
};

export type GeoPdfCrs = {
  epsg?: number;
  wkt?: string;
};

export type GeoPdfViewport = {
  name?: string;
  // user space
  bbox: Box;
  controlPoints: GeoPdfControlPoint[];
  // map frame (neatline) in user space
  neatline: Point[];
  crs?: GeoPdfCrs;
  // false when the datum is known and it differs from WGS84 (or a datum compatible with it at the map scale)
  datumCompatible: boolean;
};

export type GeoPdfPage = {
  pageIndex: number;
  // crop box intersected with the media box (user space)
  box: Box;
  rotate: number;
  viewports: GeoPdfViewport[];
};

export type GeoPdfInfo = {
  pagesCount: number;
  // georeferenced pages only
  pages: GeoPdfPage[];
  // the file contains a georeferencing in the OGC "GeoPDF" encoding (LGIDict), not supported yet
  hasUnsupportedGeoreference: boolean;
};

const DEFAULT_BOUNDS = [0, 0, 0, 1, 1, 1, 1, 0];

// datums equivalent to WGS84 at the scale of a map (differences below ~1-2 m)
const WGS84_COMPATIBLE_DATUM_PATTERNS = [
  /WGS[ _]?(19)?84/i,
  /ETRS/i,
  /EUREF/i,
  /NAD[ _]?(19)?83/i,
  /North[ _]American[ _]Datum[ _]1983/i,
  /GDA[ _]?(19)?94/i,
  /GDA[ _]?2020/i,
  /SIRGAS/i,
  /ITRF/i,
  /Pseudo[ _-]Mercator/i,
];

const WGS84_COMPATIBLE_EPSG_CODES = new Set([
  4326, 3857, 900913, 4258, 4269, 4283, 7844, 4674, 3395,
]);

const isWgs84CompatibleEpsg = (epsg: number): boolean =>
  WGS84_COMPATIBLE_EPSG_CODES.has(epsg) ||
  // UTM WGS84 north / south
  (epsg >= 32601 && epsg <= 32660) ||
  (epsg >= 32701 && epsg <= 32760) ||
  // UTM ETRS89
  (epsg >= 25828 && epsg <= 25838) ||
  // UTM NAD83
  (epsg >= 26901 && epsg <= 26923);

const isDatumCompatible = (crs: GeoPdfCrs | undefined): boolean => {
  if (!crs) return true;
  if (crs.epsg !== undefined) return isWgs84CompatibleEpsg(crs.epsg);
  if (crs.wkt) {
    // the datum is defined in the DATUM (or GEOGCS) element of the WKT
    const datumMatch = /DATUM\s*\[\s*"([^"]*)"/i.exec(crs.wkt);
    const datumText = datumMatch?.[1] ?? crs.wkt;
    return WGS84_COMPATIBLE_DATUM_PATTERNS.some((pattern) =>
      pattern.test(datumText),
    );
  }
  return true;
};

type Resolver = (obj: PDFObject | undefined) => PDFObject | undefined;

const getNumbers = (
  obj: PDFObject | undefined,
  resolve: Resolver,
): number[] => {
  const resolved = resolve(obj);
  if (!(resolved instanceof PDFArray)) return [];
  const numbers: number[] = [];
  for (const item of resolved.asArray()) {
    const value = resolve(item);
    if (value instanceof PDFNumber) numbers.push(value.asNumber());
  }
  return numbers;
};

const getText = (
  obj: PDFObject | undefined,
  resolve: Resolver,
): string | undefined => {
  const resolved = resolve(obj);
  if (resolved instanceof PDFString || resolved instanceof PDFHexString) {
    return resolved.decodeText();
  }
  if (resolved instanceof PDFName) return resolved.decodeText();
  return undefined;
};

const getNameValue = (
  dict: PDFDict,
  key: string,
  resolve: Resolver,
): string | undefined => {
  const value = resolve(dict.get(PDFName.of(key)));
  return value instanceof PDFName ? value.decodeText() : undefined;
};

const toBox = (numbers: number[]): Box | null => {
  if (numbers.length < 4) return null;
  const [x1, y1, x2, y2] = numbers as [number, number, number, number];
  return {
    x1: Math.min(x1, x2),
    y1: Math.min(y1, y2),
    x2: Math.max(x1, x2),
    y2: Math.max(y1, y2),
  };
};

const intersectBoxes = (a: Box, b: Box): Box => ({
  x1: Math.max(a.x1, b.x1),
  y1: Math.max(a.y1, b.y1),
  x2: Math.min(a.x2, b.x2),
  y2: Math.min(a.y2, b.y2),
});

// point in the unit square of the bbox (origin bottom-left) -> user space
const unitToUser = (bbox: Box, ux: number, uy: number): Point => ({
  x: bbox.x1 + ux * (bbox.x2 - bbox.x1),
  y: bbox.y1 + uy * (bbox.y2 - bbox.y1),
});

const toPairs = (numbers: number[]): [number, number][] => {
  const pairs: [number, number][] = [];
  for (let index = 0; index + 1 < numbers.length; index += 2) {
    pairs.push([numbers[index]!, numbers[index + 1]!]);
  }
  return pairs;
};

const readCrs = (
  measure: PDFDict,
  resolve: Resolver,
): GeoPdfCrs | undefined => {
  const gcs = resolve(measure.get(PDFName.of("GCS")));
  if (!(gcs instanceof PDFDict)) return undefined;
  const epsgObj = resolve(gcs.get(PDFName.of("EPSG")));
  const epsg = epsgObj instanceof PDFNumber ? epsgObj.asNumber() : undefined;
  const wkt = getText(gcs.get(PDFName.of("WKT")), resolve);
  if (epsg === undefined && !wkt) return undefined;
  return { ...(epsg !== undefined ? { epsg } : {}), ...(wkt ? { wkt } : {}) };
};

const readViewport = (
  viewportObj: PDFObject | undefined,
  resolve: Resolver,
): GeoPdfViewport | null => {
  const viewport = resolve(viewportObj);
  if (!(viewport instanceof PDFDict)) return null;
  const measure = resolve(viewport.get(PDFName.of("Measure")));
  if (!(measure instanceof PDFDict)) return null;
  if (getNameValue(measure, "Subtype", resolve) !== "GEO") return null;

  const bbox = toBox(getNumbers(viewport.get(PDFName.of("BBox")), resolve));
  if (!bbox || bbox.x2 <= bbox.x1 || bbox.y2 <= bbox.y1) return null;

  const gpts = toPairs(getNumbers(measure.get(PDFName.of("GPTS")), resolve));
  const lpts = toPairs(getNumbers(measure.get(PDFName.of("LPTS")), resolve));
  const pointsCount = Math.min(gpts.length, lpts.length);
  if (pointsCount < 3) return null;

  // GPTS are latitude/longitude pairs; some writers swap them: detect it from the values range
  const swapped = gpts.some(([first]) => Math.abs(first) > 90);
  const controlPoints: GeoPdfControlPoint[] = [];
  for (let index = 0; index < pointsCount; index += 1) {
    const [g1, g2] = gpts[index]!;
    const [lx, ly] = lpts[index]!;
    controlPoints.push({
      user: unitToUser(bbox, lx, ly),
      latLng: swapped
        ? { latitude: g2, longitude: g1 }
        : { latitude: g1, longitude: g2 },
    });
  }

  const boundsNumbers = getNumbers(measure.get(PDFName.of("Bounds")), resolve);
  const bounds = toPairs(
    boundsNumbers.length >= 6 ? boundsNumbers : DEFAULT_BOUNDS,
  );
  const neatline = bounds.map(([ux, uy]) => unitToUser(bbox, ux, uy));

  const crs = readCrs(measure, resolve);
  const name = getText(viewport.get(PDFName.of("Name")), resolve);

  return {
    ...(name ? { name } : {}),
    bbox,
    controlPoints,
    neatline,
    ...(crs ? { crs } : {}),
    datumCompatible: isDatumCompatible(crs),
  };
};

const boxArea = ({ x1, y1, x2, y2 }: Box): number => (x2 - x1) * (y2 - y1);

const parse = async (bytes: Uint8Array | ArrayBuffer): Promise<GeoPdfInfo> => {
  const doc = await PDFDocument.load(bytes, {
    ignoreEncryption: true,
    updateMetadata: false,
    throwOnInvalidObject: false,
  });
  const resolve: Resolver = (obj) =>
    obj instanceof PDFRef ? doc.context.lookup(obj) : obj;

  const docPages = doc.getPages();
  const pages: GeoPdfPage[] = [];
  let hasUnsupportedGeoreference = false;

  docPages.forEach((page, pageIndex) => {
    const pageDict = page.node;
    if (pageDict.get(PDFName.of("LGIDict"))) {
      hasUnsupportedGeoreference = true;
    }
    const vp = resolve(pageDict.get(PDFName.of("VP")));
    if (!(vp instanceof PDFArray)) return;

    const viewports = vp
      .asArray()
      .map((item) => readViewport(item, resolve))
      .filter((item): item is GeoPdfViewport => item !== null)
      // main map frame first
      .sort((a, b) => boxArea(b.bbox) - boxArea(a.bbox));
    if (viewports.length === 0) return;

    const mediaBox = page.getMediaBox();
    const cropBox = page.getCropBox();
    const toBoxFromRect = ({ x, y, width, height }: typeof mediaBox): Box => ({
      x1: Math.min(x, x + width),
      y1: Math.min(y, y + height),
      x2: Math.max(x, x + width),
      y2: Math.max(y, y + height),
    });
    pages.push({
      pageIndex,
      box: intersectBoxes(toBoxFromRect(cropBox), toBoxFromRect(mediaBox)),
      rotate: page.getRotation().angle,
      viewports,
    });
  });

  return {
    pagesCount: docPages.length,
    pages,
    hasUnsupportedGeoreference:
      hasUnsupportedGeoreference && pages.length === 0,
  };
};

export const GeoPdfParser = {
  parse,
  isDatumCompatible,
};
