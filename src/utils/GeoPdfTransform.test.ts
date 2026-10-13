import { GeoPdfTransform, Point } from "./GeoPdfTransform";

const expectPointClose = (actual: Point, expected: Point, precision = 6) => {
  expect(actual.x).toBeCloseTo(expected.x, precision);
  expect(actual.y).toBeCloseTo(expected.y, precision);
};

describe("GeoPdfTransform", () => {
  test("mercator conversion round trip", () => {
    const latLng = { latitude: 41.9028, longitude: 12.4964 };
    const mercator = GeoPdfTransform.latLngToMercator(latLng);
    expect(mercator.x).toBeCloseTo(1391092.9, 0);
    expect(mercator.y).toBeCloseTo(5146430.5, 0);
    const back = GeoPdfTransform.mercatorToLatLng(mercator);
    expect(back.latitude).toBeCloseTo(latLng.latitude, 9);
    expect(back.longitude).toBeCloseTo(latLng.longitude, 9);
  });

  test("world pixels round trip", () => {
    const mercator = { x: 1391092.9, y: 5146430.5 };
    const pixel = GeoPdfTransform.mercatorToWorldPixel(mercator, 10);
    // tile 547/380 at zoom 10
    expect(Math.floor(pixel.x / 256)).toBe(547);
    expect(Math.floor(pixel.y / 256)).toBe(380);
    expectPointClose(GeoPdfTransform.worldPixelToMercator(pixel, 10), mercator);
  });

  test("homography from 4 points maps them exactly", () => {
    const src = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 200 },
      { x: 0, y: 200 },
    ];
    // a perspective-like quadrilateral
    const dst = [
      { x: 1000, y: 5000 },
      { x: 1210, y: 5020 },
      { x: 1190, y: 5390 },
      { x: 990, y: 5400 },
    ];
    const H = GeoPdfTransform.computeHomography(src, dst)!;
    expect(H).not.toBeNull();
    src.forEach((p, index) =>
      expectPointClose(GeoPdfTransform.applyHomography(H, p), dst[index]!),
    );
    const inverse = GeoPdfTransform.invertHomography(H)!;
    dst.forEach((p, index) =>
      expectPointClose(
        GeoPdfTransform.applyHomography(inverse, p),
        src[index]!,
      ),
    );
  });

  test("homography from more points (least squares) of an affine transform is exact", () => {
    const affine = (p: Point): Point => ({
      x: 2 * p.x - 0.5 * p.y + 10,
      y: 0.3 * p.x + 1.5 * p.y - 4,
    });
    const src = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: 5, y: 3 },
    ];
    const H = GeoPdfTransform.computeHomography(src, src.map(affine))!;
    expectPointClose(
      GeoPdfTransform.applyHomography(H, { x: 7, y: 2 }),
      affine({ x: 7, y: 2 }),
    );
  });

  test("homography of aligned points is null", () => {
    const src = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ];
    expect(GeoPdfTransform.computeHomography(src, src)).toBeNull();
  });

  test("affine from 3 points", () => {
    const src = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ];
    const dst = [
      { x: 5, y: 6 },
      { x: 7, y: 6 },
      { x: 5, y: 9 },
    ];
    const m = GeoPdfTransform.computeAffine(src, dst)!;
    expect(m).toEqual([2, 0, 0, 3, 5, 6]);
    expectPointClose(GeoPdfTransform.applyAffine(m, { x: 1, y: 1 }), {
      x: 7,
      y: 9,
    });
  });

  describe("user to display matrix", () => {
    const box = { x1: 10, y1: 20, x2: 110, y2: 220 };
    // user space corners: lower-left, upper-left
    const lowerLeft = { x: 10, y: 20 };
    const upperLeft = { x: 10, y: 220 };

    test("no rotation: y axis flipped, origin top-left", () => {
      const m = GeoPdfTransform.computeUserToDisplayMatrix({ box, rotate: 0 });
      expectPointClose(GeoPdfTransform.applyAffine(m, upperLeft), {
        x: 0,
        y: 0,
      });
      expectPointClose(GeoPdfTransform.applyAffine(m, lowerLeft), {
        x: 0,
        y: 200,
      });
      expect(GeoPdfTransform.getDisplaySize({ box, rotate: 0 })).toEqual({
        width: 100,
        height: 200,
      });
    });

    test("rotation 90 (clockwise): upper-left corner goes to the top-right", () => {
      const m = GeoPdfTransform.computeUserToDisplayMatrix({ box, rotate: 90 });
      expectPointClose(GeoPdfTransform.applyAffine(m, upperLeft), {
        x: 200,
        y: 0,
      });
      expectPointClose(GeoPdfTransform.applyAffine(m, lowerLeft), {
        x: 0,
        y: 0,
      });
      expect(GeoPdfTransform.getDisplaySize({ box, rotate: 90 })).toEqual({
        width: 200,
        height: 100,
      });
    });

    test("rotation 180: upper-left corner goes to the bottom-right", () => {
      const m = GeoPdfTransform.computeUserToDisplayMatrix({
        box,
        rotate: 180,
      });
      expectPointClose(GeoPdfTransform.applyAffine(m, upperLeft), {
        x: 100,
        y: 200,
      });
    });

    test("rotation 270: upper-left corner goes to the bottom-left", () => {
      const m = GeoPdfTransform.computeUserToDisplayMatrix({
        box,
        rotate: -90,
      });
      expectPointClose(GeoPdfTransform.applyAffine(m, upperLeft), {
        x: 0,
        y: 100,
      });
      expectPointClose(GeoPdfTransform.applyAffine(m, lowerLeft), {
        x: 200,
        y: 100,
      });
    });
  });

  test("native zoom of a 1:25000 map rendered at 200 dpi", () => {
    // 1 point = 1/72 inch = 0.3528 mm on paper = 8.82 m on the ground at 1:25000
    const metersPerPoint = (25000 * 0.0254) / 72;
    const lat = 45;
    // mercator meters are stretched by 1/cos(lat)
    const scale = metersPerPoint / Math.cos((lat * Math.PI) / 180);
    const H = [scale, 0, 0, 0, -scale, 5621521, 0, 0, 1];
    const zoom = GeoPdfTransform.computeNativeZoom({
      displayToMercator: H,
      displayCenter: { x: 0, y: 0 },
      dpi: 200,
    });
    // ground resolution at 200 dpi: 3.175 m/px -> zoom ~15.2 at 45 degrees
    expect(zoom).toBeGreaterThan(15);
    expect(zoom).toBeLessThan(15.5);
  });
});
