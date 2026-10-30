import { LatLng } from "model/LocationPoint";

// Geometry used to place a geospatial PDF page on a Web Mercator (XYZ tiles) map.
//
// Coordinate spaces:
// - user space: PDF page coordinates (points, origin bottom-left, y up), as in the georeferencing dictionaries;
// - display space: the page as shown (points, origin top-left, y down, crop box and /Rotate applied);
//   it is the space expected by the native renderer (same as Android PdfRenderer / pdfium);
// - mercator: Web Mercator meters (EPSG:3857);
// - world pixels: pixels of the whole world at a zoom level (256 px tiles, origin top-left).

export type Point = { x: number; y: number };

// affine transform [a, b, c, d, e, f]: x' = a*x + c*y + e; y' = b*x + d*y + f
export type AffineMatrix = [number, number, number, number, number, number];

// projective transform: 3x3 matrix, row-major
export type Homography = number[];

export type Box = { x1: number; y1: number; x2: number; y2: number };

const EARTH_RADIUS = 6378137;
const MERCATOR_HALF_WORLD = Math.PI * EARTH_RADIUS;
const MAX_LATITUDE = 85.05112878;
const TILE_SIZE = 256;

const latLngToMercator = ({ latitude, longitude }: LatLng): Point => {
  const lat = Math.max(-MAX_LATITUDE, Math.min(MAX_LATITUDE, latitude));
  return {
    x: (longitude * Math.PI * EARTH_RADIUS) / 180,
    y: EARTH_RADIUS * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)),
  };
};

const mercatorToLatLng = ({ x, y }: Point): LatLng => ({
  latitude:
    (2 * Math.atan(Math.exp(y / EARTH_RADIUS)) - Math.PI / 2) * (180 / Math.PI),
  longitude: (x / EARTH_RADIUS) * (180 / Math.PI),
});

const worldPixelsSize = (zoom: number): number => TILE_SIZE * 2 ** zoom;

const mercatorToWorldPixel = ({ x, y }: Point, zoom: number): Point => {
  const scale = worldPixelsSize(zoom) / (2 * MERCATOR_HALF_WORLD);
  return {
    x: (x + MERCATOR_HALF_WORLD) * scale,
    y: (MERCATOR_HALF_WORLD - y) * scale,
  };
};

const worldPixelToMercator = ({ x, y }: Point, zoom: number): Point => {
  const scale = (2 * MERCATOR_HALF_WORLD) / worldPixelsSize(zoom);
  return {
    x: x * scale - MERCATOR_HALF_WORLD,
    y: MERCATOR_HALF_WORLD - y * scale,
  };
};

// index of the row (from col down) with the largest absolute value in the column
const findPivotRow = (m: number[][], col: number): number => {
  let pivot = col;
  for (let row = col + 1; row < m.length; row += 1) {
    if (Math.abs(m[row]![col]!) > Math.abs(m[pivot]![col]!)) pivot = row;
  }
  return pivot;
};

// subtracts the pivot row from the other rows, to set the column to 0 in all of them
const eliminateColumn = (m: number[][], col: number): void => {
  const pivotRow = m[col]!;
  m.forEach((row, rowIndex) => {
    if (rowIndex === col) return;
    const factor = row[col]! / pivotRow[col]!;
    for (let k = col; k < row.length; k += 1) {
      row[k] = row[k]! - factor * pivotRow[k]!;
    }
  });
};

// solves A x = b with Gauss-Jordan elimination (partial pivoting); returns null if A is singular
const solveLinearSystem = (A: number[][], b: number[]): number[] | null => {
  const n = b.length;
  const m = A.map((row, i) => [...row, b[i]!]);
  for (let col = 0; col < n; col += 1) {
    const pivot = findPivotRow(m, col);
    if (Math.abs(m[pivot]![col]!) < 1e-12) return null;
    [m[col], m[pivot]] = [m[pivot]!, m[col]!];
    eliminateColumn(m, col);
  }
  return m.map((row, i) => row[n]! / row[i]!);
};

// normalizes the points (centroid at the origin, average distance sqrt(2)) to keep the system well conditioned
const computeNormalization = (points: Point[]): Homography => {
  const cx = points.reduce((acc, p) => acc + p.x, 0) / points.length;
  const cy = points.reduce((acc, p) => acc + p.y, 0) / points.length;
  const meanDist =
    points.reduce((acc, p) => acc + Math.hypot(p.x - cx, p.y - cy), 0) /
    points.length;
  const s = meanDist > 0 ? Math.SQRT2 / meanDist : 1;
  return [s, 0, -s * cx, 0, s, -s * cy, 0, 0, 1];
};

const multiplyHomographies = (A: Homography, B: Homography): Homography => {
  const result: number[] = new Array(9).fill(0);
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      let sum = 0;
      for (let k = 0; k < 3; k += 1) {
        sum += A[row * 3 + k]! * B[k * 3 + col]!;
      }
      result[row * 3 + col] = sum;
    }
  }
  return result;
};

const invertHomography = (H: Homography): Homography | null => {
  const [a, b, c, d, e, f, g, h, i] = H as [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ];
  const A = e * i - f * h;
  const B = -(d * i - f * g);
  const C = d * h - e * g;
  const det = a * A + b * B + c * C;
  if (Math.abs(det) < 1e-18) return null;
  return [
    A / det,
    -(b * i - c * h) / det,
    (b * f - c * e) / det,
    B / det,
    (a * i - c * g) / det,
    -(a * f - c * d) / det,
    C / det,
    -(a * h - b * g) / det,
    (a * e - b * d) / det,
  ];
};

const applyHomography = (H: Homography, { x, y }: Point): Point => {
  const w = H[6]! * x + H[7]! * y + H[8]!;
  return {
    x: (H[0]! * x + H[1]! * y + H[2]!) / w,
    y: (H[3]! * x + H[4]! * y + H[5]!) / w,
  };
};

const affineToHomography = ([a, b, c, d, e, f]: AffineMatrix): Homography => [
  a,
  c,
  e,
  b,
  d,
  f,
  0,
  0,
  1,
];

// Computes the transform mapping the source points to the destination points:
// 3 points: affine; 4 points: projective (exact); more points: projective (least squares).
// Returns null when the points are degenerate (e.g. aligned).
const computeHomography = (src: Point[], dst: Point[]): Homography | null => {
  const count = Math.min(src.length, dst.length);
  if (count < 3) return null;
  const srcPoints = src.slice(0, count);
  const dstPoints = dst.slice(0, count);
  const srcNorm = computeNormalization(srcPoints);
  const dstNorm = computeNormalization(dstPoints);
  const s = srcPoints.map((p) => applyHomography(srcNorm, p));
  const d = dstPoints.map((p) => applyHomography(dstNorm, p));

  let normalized: Homography | null;
  if (count === 3) {
    const affine = computeAffine(s, d);
    normalized = affine ? affineToHomography(affine) : null;
  } else {
    // rows of the DLT system with h33 = 1, solved with normal equations (exact when count = 4)
    const A: number[][] = [];
    const b: number[] = [];
    for (let index = 0; index < count; index += 1) {
      const { x, y } = s[index]!;
      const { x: u, y: v } = d[index]!;
      A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
      b.push(u);
      A.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
      b.push(v);
    }
    const AtA: number[][] = [];
    const Atb: number[] = [];
    for (let row = 0; row < 8; row += 1) {
      AtA.push(
        Array.from({ length: 8 }, (_, col) =>
          A.reduce((acc, r) => acc + r[row]! * r[col]!, 0),
        ),
      );
      Atb.push(A.reduce((acc, r, k) => acc + r[row]! * b[k]!, 0));
    }
    const h = solveLinearSystem(AtA, Atb);
    normalized = h ? [...h, 1] : null;
  }
  if (!normalized) return null;
  const dstNormInverse = invertHomography(dstNorm);
  if (!dstNormInverse) return null;
  return multiplyHomographies(
    multiplyHomographies(dstNormInverse, normalized),
    srcNorm,
  );
};

// affine transform mapping the first 3 source points exactly to the first 3 destination points
const computeAffine = (src: Point[], dst: Point[]): AffineMatrix | null => {
  const [p0, p1, p2] = src;
  const [q0, q1, q2] = dst;
  if (!p0 || !p1 || !p2 || !q0 || !q1 || !q2) return null;
  const A = [
    [p0.x, p0.y, 1],
    [p1.x, p1.y, 1],
    [p2.x, p2.y, 1],
  ];
  const xs = solveLinearSystem(A, [q0.x, q1.x, q2.x]);
  const ys = solveLinearSystem(A, [q0.y, q1.y, q2.y]);
  if (!xs || !ys) return null;
  // x' = xs[0]*x + xs[1]*y + xs[2]; y' = ys[0]*x + ys[1]*y + ys[2]
  return [xs[0]!, ys[0]!, xs[1]!, ys[1]!, xs[2]!, ys[2]!];
};

const applyAffine = (
  [a, b, c, d, e, f]: AffineMatrix,
  { x, y }: Point,
): Point => ({
  x: a * x + c * y + e,
  y: b * x + d * y + f,
});

const normalizeRotation = (rotate: number): number =>
  ((rotate % 360) + 360) % 360;

// Transform from user space to display space, for a page with the specified (crop) box and /Rotate.
// Same as pdfium's page matrix followed by the y-axis flip (used by Android PdfRenderer).
const computeUserToDisplayMatrix = ({
  box,
  rotate,
}: {
  box: Box;
  rotate: number;
}): AffineMatrix => {
  const left = Math.min(box.x1, box.x2);
  const right = Math.max(box.x1, box.x2);
  const bottom = Math.min(box.y1, box.y2);
  const top = Math.max(box.y1, box.y2);
  switch (normalizeRotation(rotate)) {
    case 90:
      // rotated page: width = box height, height = box width
      return [0, 1, 1, 0, -bottom, -left];
    case 180:
      return [-1, 0, 0, 1, right, -bottom];
    case 270:
      return [0, -1, -1, 0, top, right];
    default:
      return [1, 0, 0, -1, -left, top];
  }
};

const getDisplaySize = ({
  box,
  rotate,
}: {
  box: Box;
  rotate: number;
}): { width: number; height: number } => {
  const width = Math.abs(box.x2 - box.x1);
  const height = Math.abs(box.y2 - box.y1);
  return normalizeRotation(rotate) % 180 === 0
    ? { width, height }
    : { width: height, height: width };
};

// Zoom level whose resolution matches the specified rendering resolution (in DPI) of the page,
// given the transform from display space to mercator meters.
const computeNativeZoom = ({
  displayToMercator,
  displayCenter,
  dpi,
}: {
  displayToMercator: Homography;
  displayCenter: Point;
  dpi: number;
}): number => {
  // mercator meters per page point, measured at the center along both axes
  const p0 = applyHomography(displayToMercator, displayCenter);
  const px = applyHomography(displayToMercator, {
    x: displayCenter.x + 1,
    y: displayCenter.y,
  });
  const py = applyHomography(displayToMercator, {
    x: displayCenter.x,
    y: displayCenter.y + 1,
  });
  const metersPerPoint =
    (Math.hypot(px.x - p0.x, px.y - p0.y) +
      Math.hypot(py.x - p0.x, py.y - p0.y)) /
    2;
  const metersPerPixel = (metersPerPoint * 72) / dpi;
  return Math.log2((2 * MERCATOR_HALF_WORLD) / (TILE_SIZE * metersPerPixel));
};

// highest zoom level at which the extent fits in the specified number of pixels
const computeZoomFittingExtent = ({
  mercatorPoints,
  maxPixels,
}: {
  mercatorPoints: Point[];
  maxPixels: number;
}): number => {
  const xs = mercatorPoints.map((p) => p.x);
  const ys = mercatorPoints.map((p) => p.y);
  const extent = Math.max(
    Math.max(...xs) - Math.min(...xs),
    Math.max(...ys) - Math.min(...ys),
  );
  if (extent <= 0) return 0;
  return Math.floor(
    Math.log2((maxPixels * 2 * MERCATOR_HALF_WORLD) / (TILE_SIZE * extent)),
  );
};

export const GeoPdfTransform = {
  TILE_SIZE,
  latLngToMercator,
  mercatorToLatLng,
  mercatorToWorldPixel,
  worldPixelToMercator,
  computeHomography,
  invertHomography,
  multiplyHomographies,
  applyHomography,
  affineToHomography,
  computeAffine,
  applyAffine,
  computeUserToDisplayMatrix,
  getDisplaySize,
  computeNativeZoom,
  computeZoomFittingExtent,
};
