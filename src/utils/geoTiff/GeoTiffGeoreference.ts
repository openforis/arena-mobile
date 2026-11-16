import { GeoTIFFImage } from "geotiff";
import { toProj4 } from "geotiff-geokeys-to-proj4";
import proj4 from "proj4";

import { LatLng } from "model/LocationPoint";

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
    "ModelTransformation" as any,
  );
  if (transformation) {
    const [a, b, , c, d, e, , f] = transformation;
    return (column, row) => [
      a! * (column + shift) + b! * (row + shift) + c!,
      d! * (column + shift) + e! * (row + shift) + f!,
    ];
  }
  const tiePoint: number[] | undefined = await fileDirectory.loadValue(
    "ModelTiepoint" as any,
  );
  const scale: number[] | undefined = await fileDirectory.loadValue(
    "ModelPixelScale" as any,
  );
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
  const projection = toProj4(geoKeys as any);
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
      return { latitude: latitude!, longitude: longitude! };
    },
  };
};

export const GeoTiffGeoreference = {
  getPixelToCrs,
  getCrs,
  hasDatumShift,
};
