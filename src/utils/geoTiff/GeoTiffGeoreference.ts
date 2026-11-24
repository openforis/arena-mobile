import { GeoTIFFImage } from "geotiff";
import { toProj4 } from "geotiff-geokeys-to-proj4";
import proj4 from "proj4";

import { LatLng } from "model/LocationPoint";
import { ImportedMapGeoreference } from "utils/GeoPdfTilePlanner";
import { GeoPdfTransform, Point } from "utils/GeoPdfTransform";

// pixel (column, row of the image corners: 0..width, 0..height) → coordinates in the image CRS
export type PixelToCrs = (column: number, row: number) => [number, number];

export type GeoTiffCrs = {
  proj4: string;
  // false when the datum differs from WGS84 and no datum shift is known (the map can be shifted)
  datumShiftKnown: boolean;
  // problems reported while reading the GeoKeys
  errors: string[];
  toLatLng: (x: number, y: number) => LatLng;
};

// GTRasterTypeGeoKey: the tie point refers to the center of the pixel
const RASTER_PIXEL_IS_POINT = 2;

const WGS84_COMPATIBLE_ELLIPSOIDS = new Set(["WGS84", "GRS80"]);

const getPixelToCrs = async (
  image: GeoTIFFImage,
): Promise<PixelToCrs | null> => {
  const fileDirectory = image.fileDirectory;
  const pixelIsPoint =
    image.getGeoKeys()?.GTRasterTypeGeoKey === RASTER_PIXEL_IS_POINT;
  const shift = pixelIsPoint ? -0.5 : 0;
  const transformation: number[] | undefined = await fileDirectory.loadValue(
    "ModelTransformation",
  );
  if (transformation) {
    const [a, b, , c, d, e, , f] = transformation;
    return (column, row) => [
      a! * (column + shift) + b! * (row + shift) + c!,
      d! * (column + shift) + e! * (row + shift) + f!,
    ];
  }
  const tiePoint: number[] | undefined =
    await fileDirectory.loadValue("ModelTiepoint");
  const scale: number[] | undefined =
    await fileDirectory.loadValue("ModelPixelScale");
  if (!tiePoint || !scale) return null;
  const [i0, j0, , x0, y0] = tiePoint;
  const [scaleX, scaleY] = scale;
  return (column, row) => [
    x0! + (column + shift - i0!) * scaleX!,
    y0! - (row + shift - j0!) * scaleY!,
  ];
};

const hasDatumShift = (proj4String: string): boolean => {
  if (/\+towgs84=|\+nadgrids=|\+datum=WGS84/.test(proj4String)) return true;
  const ellipsoid = /\+ellps=(\S+)/.exec(proj4String)?.[1];
  return !!ellipsoid && WGS84_COMPATIBLE_ELLIPSOIDS.has(ellipsoid);
};

const getCrs = (image: GeoTIFFImage): GeoTiffCrs | null => {
  const geoKeys = image.getGeoKeys();
  if (!geoKeys) return null;
  const projection = toProj4(geoKeys);
  const converter = proj4(projection.proj4, "WGS84");
  return {
    proj4: projection.proj4,
    datumShiftKnown: hasDatumShift(projection.proj4),
    errors: Object.entries(projection.errors ?? {}).map(
      ([key, value]) => `${key}: ${String(value)}`,
    ),
    toLatLng: (x, y) => {
      const point = projection.convertCoordinates({ x, y, z: 0 });
      const [longitude, latitude] = converter.forward([point.x, point.y]);
      return { latitude, longitude };
    },
  };
};

const GRID_SIZE = 5;

const pixelToLatLng = (
  pixelToCrs: PixelToCrs,
  crs: Pick<GeoTiffCrs, "toLatLng">,
  { x, y }: Point,
): LatLng => crs.toLatLng(...pixelToCrs(x, y));

// image pixels → web mercator: homography fitted on a grid of points projected exactly;
// the "display space" of the tile planner is the image pixel space (origin top-left, y down)
const computeGeoreference = ({
  width,
  height,
  pixelToCrs,
  crs,
}: {
  width: number;
  height: number;
  pixelToCrs: PixelToCrs;
  crs: Pick<GeoTiffCrs, "toLatLng" | "datumShiftKnown">;
}): {
  georeference: ImportedMapGeoreference;
  // max distance between the fitted and the exact position of the grid cell centers
  maxFitErrorMeters: number;
} | null => {
  const gridPoints: Point[] = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      gridPoints.push({
        x: (col * width) / (GRID_SIZE - 1),
        y: (row * height) / (GRID_SIZE - 1),
      });
    }
  }
  const toMercator = (point: Point) =>
    GeoPdfTransform.latLngToMercator(pixelToLatLng(pixelToCrs, crs, point));
  const displayToMercator = GeoPdfTransform.computeHomography(
    gridPoints,
    gridPoints.map(toMercator),
  );
  if (!displayToMercator) return null;
  const mercatorToDisplay = GeoPdfTransform.invertHomography(displayToMercator);
  if (!mercatorToDisplay) return null;

  const neatlineDisplay: Point[] = [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width, y: height },
    { x: 0, y: height },
  ];
  const neatline = neatlineDisplay.map((point) =>
    GeoPdfTransform.mercatorToLatLng(
      GeoPdfTransform.applyHomography(displayToMercator, point),
    ),
  );
  // mercator meters are stretched by 1/cos(latitude)
  const latitudeScale = Math.cos(
    (neatline.reduce((sum, p) => sum + p.latitude, 0) / neatline.length) *
      (Math.PI / 180),
  );
  const cellCenters = gridPoints
    .filter(({ x, y }) => x < width && y < height)
    .map(({ x, y }) => ({
      x: x + width / (GRID_SIZE - 1) / 2,
      y: y + height / (GRID_SIZE - 1) / 2,
    }));
  const maxFitErrorMeters = Math.max(
    ...cellCenters.map((point) => {
      const fitted = GeoPdfTransform.applyHomography(displayToMercator, point);
      const exact = toMercator(point);
      return Math.hypot(fitted.x - exact.x, fitted.y - exact.y) * latitudeScale;
    }),
  );
  return {
    georeference: {
      pageIndex: 0,
      displayToMercator,
      mercatorToDisplay,
      neatlineDisplay,
      neatline,
      datumCompatible: crs.datumShiftKnown,
    },
    maxFitErrorMeters,
  };
};

export const GeoTiffGeoreference = {
  getPixelToCrs,
  getCrs,
  hasDatumShift,
  computeGeoreference,
};
