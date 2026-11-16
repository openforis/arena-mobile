import { AffineMatrix, GeoPdfTransform, Point } from "utils/GeoPdfTransform";

import { Window } from "./GeoTiffWindowReader";

// Part of the GeoTIFF to decode for a render block of the tile planner:
// the image window covered by the block, read from the smallest image (full resolution or overview)
// still at least as detailed as the block, and the matrix from the window pixels to the block pixels.

export type ImageLevelSize = { width: number; height: number };

export type BlockWindowPlan = {
  // index of the image: 0 = full resolution, then the overviews
  level: number;
  // window in the pixels of the image of the level
  window: Window;
  // one pixel every `step` pixels (when no overview is small enough)
  step: number;
  // window pixels (after the step) → block pixels
  matrix: AffineMatrix;
};

// pixels added around the window: the bilinear filtering reads the neighbors
const WINDOW_MARGIN = 2;

// a ∘ b: applies b, then a
const composeAffine = (
  [a1, b1, c1, d1, e1, f1]: AffineMatrix,
  [a2, b2, c2, d2, e2, f2]: AffineMatrix,
): AffineMatrix => [
  a1 * a2 + c1 * b2,
  b1 * a2 + d1 * b2,
  a1 * c2 + c1 * d2,
  b1 * c2 + d1 * d2,
  a1 * e2 + c1 * f2 + e1,
  b1 * e2 + d1 * f2 + f1,
];

const invertAffine = ([
  a,
  b,
  c,
  d,
  e,
  f,
]: AffineMatrix): AffineMatrix | null => {
  const det = a * d - b * c;
  if (Math.abs(det) < 1e-12) return null;
  return [
    d / det,
    -b / det,
    -c / det,
    a / det,
    (c * f - d * e) / det,
    (b * e - a * f) / det,
  ];
};

// image pixels covered by the block, in full resolution pixels
const computeFullResolutionWindow = ({
  blockToImage,
  blockWidth,
  blockHeight,
  imageSize,
}: {
  blockToImage: AffineMatrix;
  blockWidth: number;
  blockHeight: number;
  imageSize: ImageLevelSize;
}): Window | null => {
  const corners: Point[] = [
    { x: 0, y: 0 },
    { x: blockWidth, y: 0 },
    { x: 0, y: blockHeight },
    { x: blockWidth, y: blockHeight },
  ].map((corner) => GeoPdfTransform.applyAffine(blockToImage, corner));
  const xs = corners.map((p) => p.x);
  const ys = corners.map((p) => p.y);
  const x0 = Math.max(0, Math.floor(Math.min(...xs)) - WINDOW_MARGIN);
  const y0 = Math.max(0, Math.floor(Math.min(...ys)) - WINDOW_MARGIN);
  const x1 = Math.min(
    imageSize.width,
    Math.ceil(Math.max(...xs)) + WINDOW_MARGIN,
  );
  const y1 = Math.min(
    imageSize.height,
    Math.ceil(Math.max(...ys)) + WINDOW_MARGIN,
  );
  return x0 < x1 && y0 < y1 ? [x0, y0, x1, y1] : null;
};

// smallest level whose pixels are not larger than the full resolution pixels per block pixel
const selectLevel = (
  levels: ImageLevelSize[],
  imagePixelsPerBlockPixel: number,
): number => {
  const [fullResolution] = levels;
  let selected = 0;
  levels.forEach((level, index) => {
    const factor = fullResolution!.width / level.width;
    const selectedFactor = fullResolution!.width / levels[selected]!.width;
    if (factor <= imagePixelsPerBlockPixel && factor > selectedFactor) {
      selected = index;
    }
  });
  return selected;
};

const planBlockWindow = ({
  blockMatrix,
  blockWidth,
  blockHeight,
  levels,
}: {
  // full resolution image pixels → block pixels
  blockMatrix: AffineMatrix;
  blockWidth: number;
  blockHeight: number;
  // full resolution first, then the overviews
  levels: ImageLevelSize[];
}): BlockWindowPlan | null => {
  const fullResolution = levels[0];
  const blockToImage = invertAffine(blockMatrix);
  if (!fullResolution || !blockToImage) return null;
  const fullWindow = computeFullResolutionWindow({
    blockToImage,
    blockWidth,
    blockHeight,
    imageSize: fullResolution,
  });
  if (!fullWindow) return null;

  const [a, b, c, d] = blockMatrix;
  const imagePixelsPerBlockPixel = 1 / Math.sqrt(Math.abs(a * d - b * c));
  const level = selectLevel(levels, imagePixelsPerBlockPixel);
  const levelSize = levels[level]!;
  const factorX = fullResolution.width / levelSize.width;
  const factorY = fullResolution.height / levelSize.height;
  const step = Math.max(1, Math.floor(imagePixelsPerBlockPixel / factorX));

  const [x0, y0, x1, y1] = fullWindow;
  const window: Window = [
    Math.floor(x0 / factorX),
    Math.floor(y0 / factorY),
    Math.min(levelSize.width, Math.ceil(x1 / factorX)),
    Math.min(levelSize.height, Math.ceil(y1 / factorY)),
  ];
  // window pixel (after the step) → full resolution pixel
  const windowToImage: AffineMatrix = [
    step * factorX,
    0,
    0,
    step * factorY,
    window[0] * factorX,
    window[1] * factorY,
  ];
  return {
    level,
    window,
    step,
    matrix: composeAffine(blockMatrix, windowToImage),
  };
};

export const GeoTiffBlockPlanner = {
  planBlockWindow,
  composeAffine,
  invertAffine,
};
