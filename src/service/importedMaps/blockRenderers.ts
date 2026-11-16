import { ImportedMapSourceType } from "model/ImportedMap";

import { GeoTiffMaps } from "./geoTiffMaps";
import { ImportedMapsStorage } from "./importedMapsStorage";
import {
  BlockRenderer,
  createPdfBlockRenderer,
} from "./importedMapTilesRenderer";

// renders the blocks of tiles of the max zoom level from the source file
export const createBlockRenderer = async ({
  sourceType,
  sourceFileUri,
  pageIndex,
}: {
  sourceType: ImportedMapSourceType;
  sourceFileUri: string;
  pageIndex: number;
}): Promise<BlockRenderer> =>
  sourceType === "geotiff"
    ? GeoTiffMaps.createBlockRenderer(sourceFileUri)
    : createPdfBlockRenderer({
        pdfPath: ImportedMapsStorage.toFileSystemPath(sourceFileUri),
        pageIndex,
      });
