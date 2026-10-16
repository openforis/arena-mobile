import { LatLng } from "./LocationPoint";

// map imported from a geospatial PDF page, rendered into map tiles stored on the device
export type PdfMap = {
  id: string;
  name: string;
  // name of the imported file
  fileName: string;
  pageIndex: number;
  // map frame on the map
  neatline: LatLng[];
  minZoom: number;
  maxZoom: number;
  tilesCount: number;
  // size of the tiles
  sizeBytes: number;
  // size of the PDF file (kept on the device)
  sourceSizeBytes: number;
  // false when the datum of the PDF is not compatible with WGS84: the map can be shifted
  datumCompatible: boolean;
  visible: boolean;
  // 0 - 1
  opacity: number;
  dateCreated: string;
  dateModified: string;
};
