import { requireOptionalNativeModule } from "expo";

// JS interface of the native module in modules/imported-map-renderer

export type RenderTileTarget = {
  // position of the tile in the rendered block
  col: number;
  row: number;
  // file system path (no file:// scheme)
  path: string;
};

export type RenderTilesOptions = {
  pdfPath: string;
  pageIndex: number;
  // display space -> block pixels: [a, b, c, d, e, f]
  matrix: number[];
  // map frame in block pixels: [x0, y0, x1, y1, ...]
  clipPolygon: number[];
  width: number;
  height: number;
  tileSize: number;
  jpegQuality: number;
  tiles: RenderTileTarget[];
};

export type RenderImageTilesOptions = {
  // size of the image (RGBA pixels, not premultiplied)
  pixelsWidth: number;
  pixelsHeight: number;
  // image pixels -> block pixels: [a, b, c, d, e, f]
  matrix: number[];
  // map frame in block pixels: [x0, y0, x1, y1, ...]
  clipPolygon: number[];
  width: number;
  height: number;
  tileSize: number;
  jpegQuality: number;
  tiles: RenderTileTarget[];
};

export type OverviewTileTarget = {
  path: string;
  // tiles of the next zoom level: top-left, top-right, bottom-left, bottom-right
  children: string[];
};

export type BuildOverviewTilesOptions = {
  tileSize: number;
  jpegQuality: number;
  tiles: OverviewTileTarget[];
};

export type TilesWriteResult = {
  // tiles written (empty tiles are skipped)
  written: number;
  bytes: number;
};

type ImportedMapRendererNativeModule = {
  getPageCount(pdfPath: string): Promise<number>;
  renderTiles(options: RenderTilesOptions): Promise<TilesWriteResult>;
  renderImageTiles(
    pixels: Uint8Array,
    options: RenderImageTilesOptions,
  ): Promise<TilesWriteResult>;
  buildOverviewTiles(
    options: BuildOverviewTilesOptions,
  ): Promise<TilesWriteResult>;
  closeDocument(): Promise<void>;
};

const nativeModule =
  requireOptionalNativeModule<ImportedMapRendererNativeModule>(
    "ImportedMapRenderer",
  );

// false in Expo Go or in builds made before the native module was added
const isAvailable = (): boolean => !!nativeModule;

const getNativeModule = (): ImportedMapRendererNativeModule => {
  if (!nativeModule) {
    throw new Error("ImportedMapRenderer native module not available");
  }
  return nativeModule;
};

export const ImportedMapRenderer = {
  isAvailable,
  getPageCount: (pdfPath: string) => getNativeModule().getPageCount(pdfPath),
  renderTiles: (options: RenderTilesOptions) =>
    getNativeModule().renderTiles(options),
  renderImageTiles: (pixels: Uint8Array, options: RenderImageTilesOptions) =>
    getNativeModule().renderImageTiles(pixels, options),
  buildOverviewTiles: (options: BuildOverviewTilesOptions) =>
    getNativeModule().buildOverviewTiles(options),
  closeDocument: () => getNativeModule().closeDocument(),
};
