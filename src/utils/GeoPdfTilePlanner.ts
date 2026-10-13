import { LatLng } from "model/LocationPoint";

import { GeoPdfPage, GeoPdfViewport } from "./GeoPdfParser";
import {
  AffineMatrix,
  GeoPdfTransform,
  Homography,
  Point,
} from "./GeoPdfTransform";
import { MapTileUtils, TileCoordinate } from "./MapTileUtils";

// Plans the rendering of a georeferenced PDF page into XYZ tiles:
// the tiles of the max zoom level are rendered from the PDF in blocks of N x N tiles
// (one native render call per block), lower zoom levels are built by downsampling.

const { TILE_SIZE } = GeoPdfTransform;

export const DEFAULT_RENDER_DPI = 200;
export const TILES_PER_BLOCK_SIDE = 4;
const MAX_ZOOM_LIMIT = 21;
// the lowest zoom level is the one at which the whole map fits in this number of pixels
const MIN_ZOOM_EXTENT_PIXELS = 512;

export type PdfMapGeoreference = {
  pageIndex: number;
  displayToMercator: Homography;
  mercatorToDisplay: Homography;
  // map frame in display space
  neatlineDisplay: Point[];
  // map frame on the map
  neatline: LatLng[];
  datumCompatible: boolean;
};

export type PdfMapZoomRange = {
  // zoom level matching the resolution of the page rendered at DEFAULT_RENDER_DPI
  nativeZoom: number;
  minZoom: number;
  maxZoom: number;
};

export type RenderBlockTile = {
  // position of the tile in the block
  col: number;
  row: number;
  tile: TileCoordinate;
};

export type RenderBlock = {
  // display space -> block pixels
  matrix: AffineMatrix;
  // map frame in block pixels: the content outside it is not rendered
  clipPolygon: Point[];
  width: number;
  height: number;
  tiles: RenderBlockTile[];
};

const computeGeoreference = ({
  page,
  viewport,
}: {
  page: GeoPdfPage;
  viewport: GeoPdfViewport;
}): PdfMapGeoreference | null => {
  const userToDisplay = GeoPdfTransform.computeUserToDisplayMatrix(page);
  const displayPoints = viewport.controlPoints.map((cp) =>
    GeoPdfTransform.applyAffine(userToDisplay, cp.user),
  );
  const mercatorPoints = viewport.controlPoints.map((cp) =>
    GeoPdfTransform.latLngToMercator(cp.latLng),
  );
  const displayToMercator = GeoPdfTransform.computeHomography(
    displayPoints,
    mercatorPoints,
  );
  if (!displayToMercator) return null;
  const mercatorToDisplay = GeoPdfTransform.invertHomography(displayToMercator);
  if (!mercatorToDisplay) return null;

  const neatlineDisplay = viewport.neatline.map((p) =>
    GeoPdfTransform.applyAffine(userToDisplay, p),
  );
  const neatline = neatlineDisplay.map((p) =>
    GeoPdfTransform.mercatorToLatLng(
      GeoPdfTransform.applyHomography(displayToMercator, p),
    ),
  );
  return {
    pageIndex: page.pageIndex,
    displayToMercator,
    mercatorToDisplay,
    neatlineDisplay,
    neatline,
    datumCompatible: viewport.datumCompatible,
  };
};

const computeCentroid = (points: Point[]): Point => ({
  x: points.reduce((acc, p) => acc + p.x, 0) / points.length,
  y: points.reduce((acc, p) => acc + p.y, 0) / points.length,
});

const computeZoomRange = (
  georeference: PdfMapGeoreference,
  dpi = DEFAULT_RENDER_DPI,
): PdfMapZoomRange => {
  const { displayToMercator, neatlineDisplay } = georeference;
  const nativeZoomExact = GeoPdfTransform.computeNativeZoom({
    displayToMercator,
    displayCenter: computeCentroid(neatlineDisplay),
    dpi,
  });
  const nativeZoom = Math.max(
    0,
    Math.min(MAX_ZOOM_LIMIT, Math.round(nativeZoomExact)),
  );
  const fittingZoom = GeoPdfTransform.computeZoomFittingExtent({
    mercatorPoints: neatlineDisplay.map((p) =>
      GeoPdfTransform.applyHomography(displayToMercator, p),
    ),
    maxPixels: MIN_ZOOM_EXTENT_PIXELS,
  });
  const minZoom = Math.max(0, Math.min(nativeZoom, fittingZoom));
  return { nativeZoom, minZoom, maxZoom: nativeZoom };
};

const computeTiles = ({
  neatline,
  minZoom,
  maxZoom,
}: {
  neatline: LatLng[];
  minZoom: number;
  maxZoom: number;
}): TileCoordinate[] =>
  MapTileUtils.computeTilesForPolygon({
    coordinates: neatline,
    minZoom,
    maxZoom,
  });

const countTiles = ({
  neatline,
  minZoom,
  maxZoom,
}: {
  neatline: LatLng[];
  minZoom: number;
  maxZoom: number;
}): number =>
  MapTileUtils.countTilesForPolygon({
    coordinates: neatline,
    minZoom,
    maxZoom,
  });

// world pixel at the specified zoom -> display space
const worldPixelToDisplay = (
  georeference: PdfMapGeoreference,
  zoom: number,
  point: Point,
): Point =>
  GeoPdfTransform.applyHomography(
    georeference.mercatorToDisplay,
    GeoPdfTransform.worldPixelToMercator(point, zoom),
  );

const displayToWorldPixel = (
  georeference: PdfMapGeoreference,
  zoom: number,
  point: Point,
): Point =>
  GeoPdfTransform.mercatorToWorldPixel(
    GeoPdfTransform.applyHomography(georeference.displayToMercator, point),
    zoom,
  );

const planRenderBlocks = ({
  georeference,
  zoom,
  tilesPerBlockSide = TILES_PER_BLOCK_SIDE,
}: {
  georeference: PdfMapGeoreference;
  zoom: number;
  tilesPerBlockSide?: number;
}): RenderBlock[] => {
  const tiles = computeTiles({
    neatline: georeference.neatline,
    minZoom: zoom,
    maxZoom: zoom,
  });
  const tilesByBlockKey = new Map<string, TileCoordinate[]>();
  for (const tile of tiles) {
    const key = `${Math.floor(tile.x / tilesPerBlockSide)}/${Math.floor(tile.y / tilesPerBlockSide)}`;
    const blockTiles = tilesByBlockKey.get(key);
    if (blockTiles) {
      blockTiles.push(tile);
    } else {
      tilesByBlockKey.set(key, [tile]);
    }
  }
  const blockSizePx = tilesPerBlockSide * TILE_SIZE;
  const blocks: RenderBlock[] = [];
  for (const [key, blockTiles] of tilesByBlockKey) {
    const [blockX, blockY] = key.split("/").map(Number) as [number, number];
    const originX = blockX * blockSizePx;
    const originY = blockY * blockSizePx;
    // the homography is approximated with an affine transform over the block (exact at 3 corners)
    const blockCorners: Point[] = [
      { x: 0, y: 0 },
      { x: blockSizePx, y: 0 },
      { x: 0, y: blockSizePx },
    ];
    const displayCorners = blockCorners.map((corner) =>
      worldPixelToDisplay(georeference, zoom, {
        x: originX + corner.x,
        y: originY + corner.y,
      }),
    );
    const matrix = GeoPdfTransform.computeAffine(displayCorners, blockCorners);
    if (!matrix) continue;
    const clipPolygon = georeference.neatlineDisplay.map((p) => {
      const worldPixel = displayToWorldPixel(georeference, zoom, p);
      return { x: worldPixel.x - originX, y: worldPixel.y - originY };
    });
    blocks.push({
      matrix,
      clipPolygon,
      width: blockSizePx,
      height: blockSizePx,
      tiles: blockTiles.map((tile) => ({
        col: tile.x - blockX * tilesPerBlockSide,
        row: tile.y - blockY * tilesPerBlockSide,
        tile,
      })),
    });
  }
  return blocks;
};

// tiles of the lower zoom levels, built from the tiles of the next zoom level (highest zoom first)
const planOverviewTiles = ({
  neatline,
  minZoom,
  maxZoom,
}: {
  neatline: LatLng[];
  minZoom: number;
  maxZoom: number;
}): TileCoordinate[] => {
  const tiles: TileCoordinate[] = [];
  for (let zoom = maxZoom - 1; zoom >= minZoom; zoom -= 1) {
    tiles.push(...computeTiles({ neatline, minZoom: zoom, maxZoom: zoom }));
  }
  return tiles;
};

export const GeoPdfTilePlanner = {
  computeGeoreference,
  computeZoomRange,
  computeTiles,
  countTiles,
  planRenderBlocks,
  planOverviewTiles,
};
