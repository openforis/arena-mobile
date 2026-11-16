import { LatLng } from "./LocationPoint";

export type ImportedMapSourceType = "pdf" | "geotiff";

// map imported from a file (geospatial PDF page or GeoTIFF), rendered into map tiles stored on the device
export type ImportedMap = {
  id: string;
  name: string;
  // name of the imported file
  fileName: string;
  // not set for the maps imported before GeoTIFF support: "pdf"
  sourceType?: ImportedMapSourceType;
  // PDF page (0 for GeoTIFF)
  pageIndex: number;
  // map frame on the map
  neatline: LatLng[];
  minZoom: number;
  maxZoom: number;
  tilesCount: number;
  // size of the tiles
  sizeBytes: number;
  // size of the source file kept on the device (PDF only: GeoTIFF files are not kept)
  sourceSizeBytes: number;
  // false when the datum of the map is not compatible with WGS84: the map can be shifted
  datumCompatible: boolean;
  visible: boolean;
  // 0 - 1
  opacity: number;
  dateCreated: string;
  dateModified: string;
};
