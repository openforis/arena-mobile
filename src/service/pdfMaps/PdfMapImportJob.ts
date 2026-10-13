import { JobMobile, JobMobileContext } from "model/JobMobile";
import { PdfMap } from "model/PdfMap";
import { Files } from "utils/Files";
import {
  GeoPdfTilePlanner,
  PdfMapGeoreference,
  RenderBlock,
} from "utils/GeoPdfTilePlanner";
import { GeoPdfTransform } from "utils/GeoPdfTransform";
import { TileCoordinate } from "utils/MapTileUtils";

import { PdfMapRenderer } from "./PdfMapRenderer";
import { PdfMapsStorage } from "./pdfMapsStorage";
import { PdfMapRepository } from "./pdfMapRepository";

const JPEG_QUALITY = 85;
const OVERVIEW_TILES_BATCH_SIZE = 32;

export type PdfMapImportJobContext = JobMobileContext & {
  // file selected by the user (it will be copied into the app storage)
  sourceFileUri: string;
  pdfMap: PdfMap;
  georeference: PdfMapGeoreference;
};

export type PdfMapImportJobResult = {
  pdfMap: PdfMap;
};

const toFlatCoordinates = (points: { x: number; y: number }[]): number[] =>
  points.flatMap(({ x, y }) => [x, y]);

export class PdfMapImportJob extends JobMobile<PdfMapImportJobContext> {
  private tilesCount = 0;
  private sizeBytes = 0;

  override async execute() {
    const { pdfMap, sourceFileUri } = this.context;
    const mapDirUri = PdfMapsStorage.getMapDirUri(pdfMap.id);
    try {
      await Files.mkDir(mapDirUri);
      const sourceCopyUri = PdfMapsStorage.getSourceFileUri(pdfMap.id);
      await Files.copyFile({ from: sourceFileUri, to: sourceCopyUri });
      const pdfPath = PdfMapsStorage.toFileSystemPath(sourceCopyUri);
      // fails if the PDF cannot be opened by the native renderer (e.g. password protected)
      await PdfMapRenderer.getPageCount(pdfPath);

      const blocks = GeoPdfTilePlanner.planRenderBlocks({
        georeference: this.context.georeference,
        zoom: pdfMap.maxZoom,
      });
      const overviewTiles = GeoPdfTilePlanner.planOverviewTiles({
        neatline: pdfMap.neatline,
        minZoom: pdfMap.minZoom,
        maxZoom: pdfMap.maxZoom,
      });
      const overviewBatches: TileCoordinate[][] = [];
      for (
        let index = 0;
        index < overviewTiles.length;
        index += OVERVIEW_TILES_BATCH_SIZE
      ) {
        overviewBatches.push(
          overviewTiles.slice(index, index + OVERVIEW_TILES_BATCH_SIZE),
        );
      }
      this.total = blocks.length + overviewBatches.length;

      for (const block of blocks) {
        if (this.isCanceled()) break;
        await this.renderBlock({ pdfPath, block });
        this.incrementProcessedItems();
      }
      for (const batch of overviewBatches) {
        if (this.isCanceled()) break;
        await this.buildOverviewTiles(batch);
        this.incrementProcessedItems();
      }
      await PdfMapRenderer.closeDocument();

      if (this.isCanceled()) {
        await Files.del(mapDirUri, true);
        return;
      }
      await this.saveMap(sourceCopyUri);
    } catch (error) {
      await PdfMapRenderer.closeDocument().catch(() => {});
      await Files.del(mapDirUri, true);
      throw error;
    }
  }

  private async renderBlock({
    pdfPath,
    block,
  }: {
    pdfPath: string;
    block: RenderBlock;
  }): Promise<void> {
    const { pdfMap, georeference } = this.context;
    const { written, bytes } = await PdfMapRenderer.renderTiles({
      pdfPath,
      pageIndex: georeference.pageIndex,
      matrix: block.matrix,
      clipPolygon: toFlatCoordinates(block.clipPolygon),
      width: block.width,
      height: block.height,
      tileSize: GeoPdfTransform.TILE_SIZE,
      jpegQuality: JPEG_QUALITY,
      tiles: block.tiles.map(({ col, row, tile }) => ({
        col,
        row,
        path: PdfMapsStorage.getTilePath(pdfMap.id, tile),
      })),
    });
    this.tilesCount += written;
    this.sizeBytes += bytes;
  }

  private async buildOverviewTiles(tiles: TileCoordinate[]): Promise<void> {
    const { id } = this.context.pdfMap;
    const { written, bytes } = await PdfMapRenderer.buildOverviewTiles({
      tileSize: GeoPdfTransform.TILE_SIZE,
      jpegQuality: JPEG_QUALITY,
      tiles: tiles.map((tile) => {
        const x = tile.x * 2;
        const y = tile.y * 2;
        const z = tile.z + 1;
        return {
          path: PdfMapsStorage.getTilePath(id, tile),
          children: [
            { x, y, z },
            { x: x + 1, y, z },
            { x, y: y + 1, z },
            { x: x + 1, y: y + 1, z },
          ].map((child) => PdfMapsStorage.getTilePath(id, child)),
        };
      }),
    });
    this.tilesCount += written;
    this.sizeBytes += bytes;
  }

  private async saveMap(sourceCopyUri: string): Promise<void> {
    const now = new Date().toISOString();
    const pdfMap: PdfMap = {
      ...this.context.pdfMap,
      tilesCount: this.tilesCount,
      sizeBytes: this.sizeBytes,
      sourceSizeBytes: await Files.getSize(sourceCopyUri),
      dateCreated: now,
      dateModified: now,
    };
    await PdfMapRepository.saveMap(pdfMap);
    this.context.pdfMap = pdfMap;
  }

  override generateResult(): Promise<PdfMapImportJobResult> {
    return Promise.resolve({ pdfMap: this.context.pdfMap });
  }
}
