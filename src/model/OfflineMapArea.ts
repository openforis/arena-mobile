import { LatLng } from "./LocationPoint";
import { MapLayerId } from "./MapLayers";

export type OfflineMapArea = {
  id: string;
  name: string;
  layerId: MapLayerId;
  coordinates: LatLng[];
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
