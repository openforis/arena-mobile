import { JobMobile, JobMobileContext } from "model/JobMobile";
import { MapLayers } from "model/MapLayers";
import { OfflineMapArea } from "model/OfflineMapArea";
import { Files } from "utils/Files";
import { log } from "utils/Logger";
import { MapTileUtils, TileCoordinate } from "utils/MapTileUtils";
import { PromiseUtils } from "utils/PromiseUtils";

import { mapTilesUserAgent } from "./mapTilesUserAgent";
import { OfflineMapAreaRepository } from "./offlineMapAreaRepository";
import { OfflineMapTilesStorage } from "./offlineMapTilesStorage";

// keep it low: free tile servers must not be overloaded
const MAX_CONCURRENT_DOWNLOADS = 4;

const HTTP_STATUS_OK = 200;

export type OfflineMapAreaDownloadJobContext = JobMobileContext & {
  area: OfflineMapArea;
};

export type OfflineMapAreaDownloadJobResult = {
  area: OfflineMapArea;
};

export class OfflineMapAreaDownloadJob extends JobMobile<OfflineMapAreaDownloadJobContext> {
  private downloadedTilesCount = 0;
  private sizeBytes = 0;
  private readonly createdDirUris = new Set<string>();

  override async execute() {
    const { area } = this.context;
    const { coordinates, minZoom, maxZoom } = area;

    const tiles = MapTileUtils.computeTilesForPolygon({
      coordinates,
      minZoom,
      maxZoom,
    });
    this.total = tiles.length;

    await PromiseUtils.runWithConcurrency({
      items: tiles,
      concurrency: MAX_CONCURRENT_DOWNLOADS,
      task: async (tile) => {
        await this.processTile(tile);
        this.incrementProcessedItems();
      },
      shouldStop: () => this.isCanceled(),
    });

    await this.saveArea(tiles.length);
  }

  private async processTile(tile: TileCoordinate): Promise<void> {
    const { layerId } = this.context.area;
    const fileUri = OfflineMapTilesStorage.getTileFileUri(layerId, tile);

    const existingSize = await Files.getSize(fileUri);
    if (existingSize > 0) {
      this.downloadedTilesCount += 1;
      this.sizeBytes += existingSize;
      return;
    }
    try {
      await this.createTileDirIfNeeded(tile);
      const layer = MapLayers.getLayer(layerId);
      const url = MapTileUtils.formatTileUrl(layer.urlTemplate, tile);
      const { status } = await Files.download(url, fileUri, {
        headers: { "User-Agent": mapTilesUserAgent },
      });
      if (status === HTTP_STATUS_OK) {
        this.downloadedTilesCount += 1;
        this.sizeBytes += await Files.getSize(fileUri);
      } else {
        await Files.del(fileUri, true);
      }
    } catch (error) {
      log.debug(
        `offline map tile download failed (${MapTileUtils.getTileKey(tile)}): ${String(error)}`,
      );
      await Files.del(fileUri, true);
    }
  }

  private async createTileDirIfNeeded(tile: TileCoordinate): Promise<void> {
    const dirUri = OfflineMapTilesStorage.getTileDirUri(
      this.context.area.layerId,
      tile,
    );
    if (this.createdDirUris.has(dirUri)) return;
    await Files.mkDir(dirUri);
    this.createdDirUris.add(dirUri);
  }

  private async saveArea(tilesCount: number): Promise<void> {
    const { area } = this.context;
    const areaUpdated: OfflineMapArea = {
      ...area,
      tilesCount,
      downloadedTilesCount: this.downloadedTilesCount,
      // tiles not processed because of cancel are considered as failed (missing)
      failedTilesCount: tilesCount - this.downloadedTilesCount,
      sizeBytes: this.sizeBytes,
      dateModified: new Date().toISOString(),
    };
    await OfflineMapAreaRepository.saveArea(areaUpdated);
    this.context.area = areaUpdated;
  }

  override generateResult(): Promise<OfflineMapAreaDownloadJobResult> {
    return Promise.resolve({ area: this.context.area });
  }
}
