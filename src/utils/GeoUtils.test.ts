import { GeoUtils } from "./GeoUtils";

describe("GeoUtils", () => {
  describe("computeRegionFromCoordinates", () => {
    it("returns defaultMapRegion for empty coordinates", () => {
      expect(GeoUtils.computeRegionFromCoordinates([])).toEqual(
        GeoUtils.defaultMapRegion,
      );
    });

    it("computes a region centered on provided coordinates", () => {
      const region = GeoUtils.computeRegionFromCoordinates([
        { latitude: 10, longitude: 20 },
        { latitude: 14, longitude: 28 },
      ]);

      expect(region.latitude).toBe(12);
      expect(region.longitude).toBe(24);
      expect(region.latitudeDelta).toBe(6);
      expect(region.longitudeDelta).toBe(12);
    });
  });

  describe("computeMidpointCoordinate", () => {
    it("computes the midpoint between two coordinates", () => {
      const midpoint = GeoUtils.computeMidpointCoordinate(
        { latitude: 10, longitude: 20 },
        { latitude: 14, longitude: 28 },
      );

      expect(midpoint).toEqual({ latitude: 12, longitude: 24 });
    });
  });

  describe("isSameCoordinate", () => {
    it("returns true for identical coordinates", () => {
      expect(
        GeoUtils.isSameCoordinate(
          { latitude: 1.2345, longitude: 2.3456 },
          { latitude: 1.2345, longitude: 2.3456 },
        ),
      ).toBe(true);
    });

    it("returns false when coordinates differ beyond epsilon", () => {
      expect(
        GeoUtils.isSameCoordinate(
          { latitude: 1, longitude: 1 },
          { latitude: 1.001, longitude: 1 },
        ),
      ).toBe(false);
    });
  });

  describe("hasCoordinate", () => {
    it("returns true when coordinate exists in array", () => {
      expect(
        GeoUtils.hasCoordinate(
          [
            { latitude: 1, longitude: 1 },
            { latitude: 2, longitude: 2 },
          ],
          { latitude: 2, longitude: 2 },
        ),
      ).toBe(true);
    });

    it("returns false when coordinate does not exist in array", () => {
      expect(
        GeoUtils.hasCoordinate(
          [
            { latitude: 1, longitude: 1 },
            { latitude: 2, longitude: 2 },
          ],
          { latitude: 3, longitude: 3 },
        ),
      ).toBe(false);
    });
  });

  describe("computePolygonArea", () => {
    const squareOneDegreeAtEquator = [
      { latitude: 0, longitude: 0 },
      { latitude: 0, longitude: 1 },
      { latitude: 1, longitude: 1 },
      { latitude: 1, longitude: 0 },
    ];
    // R^2 * deltaLongitude (rad) * (sin(1 deg) - sin(0))
    const expectedArea =
      6378137 ** 2 * (Math.PI / 180) * Math.sin(Math.PI / 180);

    it("returns 0 when the coordinates are less than 3", () => {
      expect(GeoUtils.computePolygonArea([])).toBe(0);
      expect(
        GeoUtils.computePolygonArea(squareOneDegreeAtEquator.slice(0, 2)),
      ).toBe(0);
    });

    it("computes the area of a 1x1 degrees square at the equator", () => {
      const area = GeoUtils.computePolygonArea(squareOneDegreeAtEquator);
      expect(area / expectedArea).toBeCloseTo(1, 6);
      // ~12391 km2
      expect(Math.round(area / 1e6)).toBe(12391);
    });

    it("does not depend on the winding order", () => {
      expect(
        GeoUtils.computePolygonArea([...squareOneDegreeAtEquator].reverse()),
      ).toBeCloseTo(GeoUtils.computePolygonArea(squareOneDegreeAtEquator), 3);
    });

    it("computes a smaller area for the same square at higher latitudes", () => {
      const squareAtHighLatitude = squareOneDegreeAtEquator.map(
        ({ latitude, longitude }) => ({ latitude: latitude + 60, longitude }),
      );
      expect(GeoUtils.computePolygonArea(squareAtHighLatitude)).toBeLessThan(
        GeoUtils.computePolygonArea(squareOneDegreeAtEquator) * 0.5,
      );
    });
  });

  describe("formatArea", () => {
    it("formats small areas in square meters", () => {
      expect(GeoUtils.formatArea(1234.4)).toBe("1234 m²");
    });

    it("formats medium areas in hectares", () => {
      expect(GeoUtils.formatArea(10000)).toBe("1.00 ha");
      expect(GeoUtils.formatArea(1234567)).toBe("123.46 ha");
    });

    it("formats big areas in square kilometers", () => {
      expect(GeoUtils.formatArea(10000000)).toBe("10.00 km²");
      expect(GeoUtils.formatArea(12392000000)).toBe("12392.00 km²");
    });
  });

  describe("extractPolygonCoordinatesFromGeoJson", () => {
    it("returns null for invalid geojson", () => {
      expect(GeoUtils.extractPolygonCoordinatesFromGeoJson(null)).toBeNull();
      expect(
        GeoUtils.extractPolygonCoordinatesFromGeoJson({ geometry: {} }),
      ).toBeNull();
    });

    it("extracts polygon coordinates and removes closing duplicate", () => {
      const geoJson = {
        geometry: {
          coordinates: [
            [
              [20, 10],
              [25, 15],
              [30, 10],
              [20, 10],
            ],
          ],
        },
      };

      expect(GeoUtils.extractPolygonCoordinatesFromGeoJson(geoJson)).toEqual([
        { latitude: 10, longitude: 20 },
        { latitude: 15, longitude: 25 },
        { latitude: 10, longitude: 30 },
      ]);
    });
  });
});
