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
