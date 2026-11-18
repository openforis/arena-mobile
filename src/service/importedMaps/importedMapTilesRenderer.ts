import {
  GeoPdfTilePlanner,
  ImportedMapGeoreference,
  RenderBlock,
} from "utils/GeoPdfTilePlanner";
import { GeoPdfTransform, Point } from "utils/GeoPdfTransform";
import { MapTileUtils, TileCoordinate } from "utils/MapTileUtils";
import { PromiseUtils } from "utils/PromiseUtils";

import {
  ImportedMapRenderer,
  RenderTileTarget,
  TilesWriteResult,
} from "./ImportedMapRenderer";

// Renders an imported map (PDF page or GeoTIFF) into XYZ tiles ({tilesPath}/{z}/{x}/{y}):
// the max zoom level is rendered from the source file, the lower ones are built by downsampling.
// Used by the import job and by the preview shown before the import.

export const JPEG_QUALITY = 85;
const OVERVIEW_TILES_BATCH_SIZE = 32;

export type ImportedMapTilesRenderResult = {
  tilesCount: number;
  sizeBytes: number;
};

// renders the tiles of a block of the max zoom level from the source file
export type BlockRenderer = {
  renderBlock: (
    block: RenderBlock,
    tilesPath: string,
  ) => Promise<TilesWriteResult>;
  close: () => Promise<void>;
};

export const toFlatCoordinates = (points: Point[]): number[] =>
  points.flatMap(({ x, y }) => [x, y]);

const getTilePath = (tilesPath: string, tile: TileCoordinate): string =>
  `${tilesPath}/${MapTileUtils.getTileRelativePath(tile)}`;

export const toBlockTileTargets = (
  block: RenderBlock,
  tilesPath: string,
): RenderTileTarget[] =>
  block.tiles.map(({ col, row, tile }) => ({
    col,
    row,
    path: getTilePath(tilesPath, tile),
  }));

const toBatches = <T>(items: T[], batchSize: number): T[][] => {
  const batches: T[][] = [];
  for (let index = 0; index < items.length; index += batchSize) {
    batches.push(items.slice(index, index + batchSize));
  }
  return batches;
};

// file system path of the PDF file (no file:// scheme)
export const createPdfBlockRenderer = ({
  pdfPath,
  pageIndex,
}: {
  pdfPath: string;
  pageIndex: number;
}): BlockRenderer => ({
  renderBlock: (block, tilesPath) =>
    ImportedMapRenderer.renderTiles({
      pdfPath,
      pageIndex,
      matrix: block.matrix,
      clipPolygon: toFlatCoordinates(block.clipPolygon),
      width: block.width,
      height: block.height,
      tileSize: GeoPdfTransform.TILE_SIZE,
      jpegQuality: JPEG_QUALITY,
      tiles: toBlockTileTargets(block, tilesPath),
    }),
  // the native renderer keeps the PDF document open
  close: () => ImportedMapRenderer.closeDocument().catch(() => {}),
});

const buildOverviewTiles = ({
  tilesPath,
  tiles,
}: {
  tilesPath: string;
  tiles: TileCoordinate[];
}) =>
  ImportedMapRenderer.buildOverviewTiles({
    tileSize: GeoPdfTransform.TILE_SIZE,
    jpegQuality: JPEG_QUALITY,
    tiles: tiles.map((tile) => {
      const x = tile.x * 2;
      const y = tile.y * 2;
      const z = tile.z + 1;
      return {
        path: getTilePath(tilesPath, tile),
        children: [
          { x, y, z },
          { x: x + 1, y, z },
          { x, y: y + 1, z },
          { x: x + 1, y: y + 1, z },
        ].map((child) => getTilePath(tilesPath, child)),
      };
    }),
  });

const renderTiles = async ({
  blockRenderer,
  georeference,
  minZoom,
  maxZoom,
  tilesPath,
  shouldStop = () => false,
  onTotal,
  onStepComplete,
}: {
  blockRenderer: BlockRenderer;
  georeference: ImportedMapGeoreference;
  minZoom: number;
  maxZoom: number;
  // file system path of the folder where the tiles will be written
  tilesPath: string;
  shouldStop?: () => boolean;
  // number of steps (native calls)
  onTotal?: (total: number) => void;
  onStepComplete?: () => void;
}): Promise<ImportedMapTilesRenderResult> => {
  const result: ImportedMapTilesRenderResult = { tilesCount: 0, sizeBytes: 0 };
  const blocks = GeoPdfTilePlanner.planRenderBlocks({
    georeference,
    zoom: maxZoom,
  });
  const overviewBatches = toBatches(
    GeoPdfTilePlanner.planOverviewTiles({
      neatline: georeference.neatline,
      minZoom,
      maxZoom,
    }),
    OVERVIEW_TILES_BATCH_SIZE,
  );
  onTotal?.(blocks.length + overviewBatches.length);
  // one step at a time: the source file is read by one renderer
  const runSequentially = <T>(
    items: T[],
    step: (item: T) => Promise<TilesWriteResult>,
  ) =>
    PromiseUtils.runWithConcurrency({
      items,
      concurrency: 1,
      shouldStop,
      task: async (item) => {
        const { written, bytes } = await step(item);
        result.tilesCount += written;
        result.sizeBytes += bytes;
        onStepComplete?.();
      },
    });
  try {
    await runSequentially(blocks, (block) =>
      blockRenderer.renderBlock(block, tilesPath),
    );
    await runSequentially(overviewBatches, (tiles) =>
      buildOverviewTiles({ tilesPath, tiles }),
    );
    return result;
  } finally {
    await blockRenderer.close();
  }
};

export const ImportedMapTilesRenderer = {
  renderTiles,
};
