import {
  GeoPdfTilePlanner,
  PdfMapGeoreference,
  RenderBlock,
} from "utils/GeoPdfTilePlanner";
import { GeoPdfTransform, Point } from "utils/GeoPdfTransform";
import { MapTileUtils, TileCoordinate } from "utils/MapTileUtils";
import { PromiseUtils } from "utils/PromiseUtils";

import { PdfMapRenderer } from "./PdfMapRenderer";

// Renders a georeferenced PDF page into XYZ tiles ({tilesPath}/{z}/{x}/{y}):
// the max zoom level is rendered from the PDF, the lower ones are built by downsampling.
// Used by the import job and by the preview shown before the import.

const JPEG_QUALITY = 85;
const OVERVIEW_TILES_BATCH_SIZE = 32;

export type PdfMapTilesRenderResult = {
  tilesCount: number;
  sizeBytes: number;
};

const toFlatCoordinates = (points: Point[]): number[] =>
  points.flatMap(({ x, y }) => [x, y]);

const getTilePath = (tilesPath: string, tile: TileCoordinate): string =>
  `${tilesPath}/${MapTileUtils.getTileRelativePath(tile)}`;

const toBatches = <T>(items: T[], batchSize: number): T[][] => {
  const batches: T[][] = [];
  for (let index = 0; index < items.length; index += batchSize) {
    batches.push(items.slice(index, index + batchSize));
  }
  return batches;
};

const renderBlock = ({
  pdfPath,
  pageIndex,
  tilesPath,
  block,
}: {
  pdfPath: string;
  pageIndex: number;
  tilesPath: string;
  block: RenderBlock;
}) =>
  PdfMapRenderer.renderTiles({
    pdfPath,
    pageIndex,
    matrix: block.matrix,
    clipPolygon: toFlatCoordinates(block.clipPolygon),
    width: block.width,
    height: block.height,
    tileSize: GeoPdfTransform.TILE_SIZE,
    jpegQuality: JPEG_QUALITY,
    tiles: block.tiles.map(({ col, row, tile }) => ({
      col,
      row,
      path: getTilePath(tilesPath, tile),
    })),
  });

const buildOverviewTiles = ({
  tilesPath,
  tiles,
}: {
  tilesPath: string;
  tiles: TileCoordinate[];
}) =>
  PdfMapRenderer.buildOverviewTiles({
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
  pdfPath,
  georeference,
  minZoom,
  maxZoom,
  tilesPath,
  shouldStop = () => false,
  onTotal,
  onStepComplete,
}: {
  // file system path of the PDF file (no file:// scheme)
  pdfPath: string;
  georeference: PdfMapGeoreference;
  minZoom: number;
  maxZoom: number;
  // file system path of the folder where the tiles will be written
  tilesPath: string;
  shouldStop?: () => boolean;
  // number of steps (native calls)
  onTotal?: (total: number) => void;
  onStepComplete?: () => void;
}): Promise<PdfMapTilesRenderResult> => {
  const result: PdfMapTilesRenderResult = { tilesCount: 0, sizeBytes: 0 };
  const addResult = ({
    written,
    bytes,
  }: {
    written: number;
    bytes: number;
  }) => {
    result.tilesCount += written;
    result.sizeBytes += bytes;
  };
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
  // one step at a time: the native renderer keeps a single PDF document open
  const runSequentially = <T>(
    items: T[],
    step: (item: T) => Promise<{ written: number; bytes: number }>,
  ) =>
    PromiseUtils.runWithConcurrency({
      items,
      concurrency: 1,
      shouldStop,
      task: async (item) => {
        addResult(await step(item));
        onStepComplete?.();
      },
    });
  try {
    await runSequentially(blocks, (block) =>
      renderBlock({
        pdfPath,
        pageIndex: georeference.pageIndex,
        tilesPath,
        block,
      }),
    );
    await runSequentially(overviewBatches, (tiles) =>
      buildOverviewTiles({ tilesPath, tiles }),
    );
    return result;
  } finally {
    await PdfMapRenderer.closeDocument().catch(() => {});
  }
};

export const PdfMapTilesRenderer = {
  renderTiles,
};
