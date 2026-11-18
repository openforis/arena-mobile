import { AffineMatrix, GeoPdfTransform } from "utils/GeoPdfTransform";

import { GeoTiffBlockPlanner } from "./GeoTiffBlockPlanner";

const { planBlockWindow, composeAffine, invertAffine } = GeoTiffBlockPlanner;

const LEVELS = [
  { width: 8000, height: 6000 },
  { width: 4000, height: 3000 },
  { width: 2000, height: 1500 },
  { width: 1000, height: 750 },
];

// full resolution pixels → block pixels: scale and offset (block origin at the image pixel origin)
const blockMatrix = (scale: number, originX: number, originY: number) =>
  [scale, 0, 0, scale, -originX * scale, -originY * scale] as AffineMatrix;

describe("GeoTiffBlockPlanner affine helpers", () => {
  it("inverts and composes affine transforms", () => {
    const m: AffineMatrix = [2, 0.5, -0.3, 1.5, 10, -4];
    const inverse = invertAffine(m)!;
    const identity = composeAffine(m, inverse);
    [1, 0, 0, 1, 0, 0].forEach((value, i) =>
      expect(identity[i]).toBeCloseTo(value, 10),
    );
  });
});

describe("planBlockWindow", () => {
  it("reads the full resolution image when the block is as detailed as the image", () => {
    const plan = planBlockWindow({
      blockMatrix: blockMatrix(1, 1000, 2000),
      blockWidth: 1024,
      blockHeight: 1024,
      levels: LEVELS,
    })!;
    expect(plan.level).toBe(0);
    expect(plan.step).toBe(1);
    expect(plan.window).toEqual([998, 1998, 2026, 3026]);
    // window pixel → block pixel: the window starts 2 px before the block
    const p = GeoPdfTransform.applyAffine(plan.matrix, { x: 2, y: 2 });
    expect(p.x).toBeCloseTo(0);
    expect(p.y).toBeCloseTo(0);
  });

  it("reads the overview matching the block resolution", () => {
    // 1 block pixel = 4.5 image pixels: overview 1:4 (2000 px)
    const plan = planBlockWindow({
      blockMatrix: blockMatrix(1 / 4.5, 0, 0),
      blockWidth: 1024,
      blockHeight: 1024,
      levels: LEVELS,
    })!;
    expect(plan.level).toBe(2);
    expect(plan.step).toBe(1);
    expect(plan.window).toEqual([0, 0, 1153, 1153]);
    // overview pixel 400 = image pixel 1600 = block pixel 355.6
    const p = GeoPdfTransform.applyAffine(plan.matrix, { x: 400, y: 400 });
    expect(p.x).toBeCloseTo(1600 / 4.5);
  });

  it("decimates the full resolution image when there are no overviews", () => {
    const plan = planBlockWindow({
      blockMatrix: blockMatrix(1 / 4.5, 0, 0),
      blockWidth: 1024,
      blockHeight: 1024,
      levels: [LEVELS[0]!],
    })!;
    expect(plan.level).toBe(0);
    expect(plan.step).toBe(4);
    // window pixel 100 = image pixel 400
    const p = GeoPdfTransform.applyAffine(plan.matrix, { x: 100, y: 0 });
    expect(p.x).toBeCloseTo(400 / 4.5);
  });

  it("covers a rotated block and clamps the window to the image", () => {
    const angle = Math.PI / 6;
    const rotation: AffineMatrix = [
      Math.cos(angle),
      Math.sin(angle),
      -Math.sin(angle),
      Math.cos(angle),
      0,
      0,
    ];
    const plan = planBlockWindow({
      blockMatrix: composeAffine(rotation, blockMatrix(1, 7500, 5500)),
      blockWidth: 1024,
      blockHeight: 1024,
      levels: LEVELS,
    })!;
    // the block goes beyond the bottom-right corner of the image: clamped
    expect(plan.window[2]).toBe(8000);
    expect(plan.window[3]).toBe(6000);
    expect(plan.window[0]).toBeGreaterThan(6900);
    expect(plan.window[1]).toBeGreaterThan(4900);
  });

  it("returns null when the block is outside the image", () => {
    expect(
      planBlockWindow({
        blockMatrix: blockMatrix(1, 9000, 0),
        blockWidth: 256,
        blockHeight: 256,
        levels: LEVELS,
      }),
    ).toBeNull();
  });
});
