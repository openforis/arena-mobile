import { LatLng } from "./LocationPoint";

export type OfflineMapArea = {
  id: string;
  name: string;
  layerId: string;
  coordinates: LatLng[];
  // surface of the polygon (missing in areas created before it was introduced)
  areaSquareMeters?: number;
  minZoom: number;
  maxZoom: number;
  tilesCount: number;
  // tiles available on the device (downloaded or already cached)
  downloadedTilesCount: number;
  failedTilesCount: number;
  sizeBytes: number;
  dateCreated: string;
  dateModified: string;
};
