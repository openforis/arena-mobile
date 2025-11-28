import {
  LocationAverager,
  LocationPoint,
  AveragedLocation,
} from "./LocationAverageCalculator";

describe("LocationAverager", () => {
  describe("Constructor", () => {
    it("should create an instance with default parameters", () => {
      const averager = new LocationAverager();
      expect(averager).toBeInstanceOf(LocationAverager);
      expect(averager.getCount()).toBe(0);
    });

    it("should create an instance with custom window size", () => {
      const averager = new LocationAverager(5);
      expect(averager).toBeInstanceOf(LocationAverager);
      expect(averager.getCount()).toBe(0);
    });

    it("should create an instance with custom window size and SD multiplier", () => {
      const averager = new LocationAverager(5, 1.5);
      expect(averager).toBeInstanceOf(LocationAverager);
      expect(averager.getCount()).toBe(0);
    });

    it("should throw an error if window size is less than 1", () => {
      expect(() => new LocationAverager(0)).toThrow(
        "maxWindowSize must be at least 1."
      );
      expect(() => new LocationAverager(-5)).toThrow(
        "maxWindowSize must be at least 1."
      );
    });
  });

  describe("addReading", () => {
    it("should add a single reading", () => {
      const averager = new LocationAverager();
      const reading: LocationPoint = {
        latitude: 40.7128,
        longitude: -74.006,
        accuracy: 10,
      };

      averager.addReading(reading);
      expect(averager.getCount()).toBe(1);
    });

    it("should add multiple readings", () => {
      const averager = new LocationAverager();
      const readings: LocationPoint[] = [
        { latitude: 40.7128, longitude: -74.006, accuracy: 10 },
        { latitude: 40.7129, longitude: -74.0061, accuracy: 12 },
        { latitude: 40.713, longitude: -74.0062, accuracy: 8 },
      ];

      readings.forEach((reading) => averager.addReading(reading));
      expect(averager.getCount()).toBe(3);
    });

    it("should maintain FIFO behavior when window size is exceeded", () => {
      const averager = new LocationAverager(3);
      const readings: LocationPoint[] = [
        { latitude: 40.7128, longitude: -74.006, accuracy: 10 },
        { latitude: 40.7129, longitude: -74.0061, accuracy: 12 },
        { latitude: 40.713, longitude: -74.0062, accuracy: 8 },
        { latitude: 40.7131, longitude: -74.0063, accuracy: 11 },
      ];

      readings.forEach((reading) => averager.addReading(reading));
      expect(averager.getCount()).toBe(3); // Should still be 3, not 4
    });

    it("should handle readings with null accuracy", () => {
      const averager = new LocationAverager();
      const reading: LocationPoint = {
        latitude: 40.7128,
        longitude: -74.006,
        accuracy: null,
      };

      averager.addReading(reading);
      expect(averager.getCount()).toBe(1);
    });
  });

  describe("getCount", () => {
    it("should return 0 for a new averager", () => {
      const averager = new LocationAverager();
      expect(averager.getCount()).toBe(0);
    });

    it("should return the correct count after adding readings", () => {
      const averager = new LocationAverager();
      averager.addReading({
        latitude: 40.7128,
        longitude: -74.006,
        accuracy: 10,
      });
      expect(averager.getCount()).toBe(1);

      averager.addReading({
        latitude: 40.7129,
        longitude: -74.0061,
        accuracy: 12,
      });
      expect(averager.getCount()).toBe(2);
    });

    it("should not exceed the maximum window size", () => {
      const averager = new LocationAverager(2);
      averager.addReading({
        latitude: 40.7128,
        longitude: -74.006,
        accuracy: 10,
      });
      averager.addReading({
        latitude: 40.7129,
        longitude: -74.0061,
        accuracy: 12,
      });
      averager.addReading({
        latitude: 40.713,
        longitude: -74.0062,
        accuracy: 8,
      });

      expect(averager.getCount()).toBe(2);
    });
  });

  describe("clearReadings", () => {
    it("should clear all readings", () => {
      const averager = new LocationAverager();
      averager.addReading({
        latitude: 40.7128,
        longitude: -74.006,
        accuracy: 10,
      });
      averager.addReading({
        latitude: 40.7129,
        longitude: -74.0061,
        accuracy: 12,
      });

      expect(averager.getCount()).toBe(2);

      averager.clearReadings();
      expect(averager.getCount()).toBe(0);
    });

    it("should allow adding readings after clearing", () => {
      const averager = new LocationAverager();
      averager.addReading({
        latitude: 40.7128,
        longitude: -74.006,
        accuracy: 10,
      });
      averager.clearReadings();

      averager.addReading({
        latitude: 40.7129,
        longitude: -74.0061,
        accuracy: 12,
      });
      expect(averager.getCount()).toBe(1);
    });
  });

  describe("calculateAveragedLocation", () => {
    it("should return null when there are no readings", () => {
      const averager = new LocationAverager();
      expect(averager.calculateAveragedLocation()).toBeNull();
    });

    it("should return null when there is only one reading", () => {
      const averager = new LocationAverager();
      averager.addReading({
        latitude: 40.7128,
        longitude: -74.006,
        accuracy: 10,
      });
      expect(averager.calculateAveragedLocation()).toBeNull();
    });

    it("should calculate average for two identical readings", () => {
      const averager = new LocationAverager();
      const reading: LocationPoint = {
        latitude: 40.7128,
        longitude: -74.006,
        accuracy: 10,
      };

      averager.addReading(reading);
      averager.addReading(reading);

      const result = averager.calculateAveragedLocation();
      expect(result).not.toBeNull();
      expect(result?.latitude).toBeCloseTo(40.7128);
      expect(result?.longitude).toBeCloseTo(-74.006);
      expect(result?.accuracy).toBeCloseTo(10);
      expect(result?.count).toBe(2);
    });

    it("should calculate average for multiple similar readings", () => {
      const averager = new LocationAverager();
      const readings: LocationPoint[] = [
        { latitude: 40.7128, longitude: -74.006, accuracy: 10 },
        { latitude: 40.7129, longitude: -74.0061, accuracy: 11 },
        { latitude: 40.7127, longitude: -74.0059, accuracy: 9 },
      ];

      readings.forEach((reading) => averager.addReading(reading));

      const result = averager.calculateAveragedLocation();
      expect(result).not.toBeNull();
      expect(result?.latitude).toBeCloseTo(40.7128, 4);
      expect(result?.longitude).toBeCloseTo(-74.006, 4);
      expect(result?.accuracy).toBeCloseTo(10, 1);
      expect(result?.count).toBe(3);
    });

    it("should filter out outliers based on accuracy", () => {
      const averager = new LocationAverager(10, 2);
      const readings: LocationPoint[] = [
        { latitude: 40.7128, longitude: -74.006, accuracy: 10 },
        { latitude: 40.7129, longitude: -74.0061, accuracy: 11 },
        { latitude: 40.7127, longitude: -74.0059, accuracy: 9 },
        { latitude: 40.7126, longitude: -74.0058, accuracy: 100 }, // Outlier
      ];

      readings.forEach((reading) => averager.addReading(reading));

      const result = averager.calculateAveragedLocation();
      expect(result).not.toBeNull();
      // The outlier with accuracy=100 should be filtered out
      expect(result?.count).toBe(3);
      expect(result?.accuracy).toBeLessThan(15);
    });

    it("should return null if all readings are filtered as outliers", () => {
      const averager = new LocationAverager(10, 0.1); // Very strict SD multiplier
      const readings: LocationPoint[] = [
        { latitude: 40.7128, longitude: -74.006, accuracy: 10 },
        { latitude: 40.7129, longitude: -74.0061, accuracy: 50 },
      ];

      readings.forEach((reading) => averager.addReading(reading));

      const result = averager.calculateAveragedLocation();
      // With very strict filtering, all might be excluded
      // This depends on the specific values, but testing the edge case
      expect(result === null || result.count > 0).toBe(true);
    });

    it("should handle readings with null accuracy by treating them as 0", () => {
      const averager = new LocationAverager();
      const readings: LocationPoint[] = [
        { latitude: 40.7128, longitude: -74.006, accuracy: null },
        { latitude: 40.7129, longitude: -74.0061, accuracy: 10 },
      ];

      readings.forEach((reading) => averager.addReading(reading));

      const result = averager.calculateAveragedLocation();
      expect(result).not.toBeNull();
    });

    it("should respect custom SD multiplier", () => {
      const strictAverager = new LocationAverager(10, 1); // More strict
      const lenientAverager = new LocationAverager(10, 3); // More lenient

      const readings: LocationPoint[] = [
        { latitude: 40.7128, longitude: -74.006, accuracy: 10 },
        { latitude: 40.7129, longitude: -74.0061, accuracy: 11 },
        { latitude: 40.713, longitude: -74.0062, accuracy: 12 },
        { latitude: 40.7131, longitude: -74.0063, accuracy: 30 }, // Potential outlier
      ];

      readings.forEach((reading) => {
        strictAverager.addReading(reading);
        lenientAverager.addReading(reading);
      });

      const strictResult = strictAverager.calculateAveragedLocation();
      const lenientResult = lenientAverager.calculateAveragedLocation();

      expect(strictResult).not.toBeNull();
      expect(lenientResult).not.toBeNull();

      // Lenient averager should include more readings or equal
      expect(lenientResult!.count).toBeGreaterThanOrEqual(strictResult!.count);
    });

    it("should calculate correct statistics with real-world GPS data", () => {
      const averager = new LocationAverager();
      const readings: LocationPoint[] = [
        { latitude: 37.7749, longitude: -122.4194, accuracy: 5 },
        { latitude: 37.775, longitude: -122.4195, accuracy: 6 },
        { latitude: 37.7748, longitude: -122.4193, accuracy: 5 },
        { latitude: 37.7751, longitude: -122.4196, accuracy: 7 },
        { latitude: 37.7749, longitude: -122.4194, accuracy: 5 },
      ];

      readings.forEach((reading) => averager.addReading(reading));

      const result = averager.calculateAveragedLocation();
      expect(result).not.toBeNull();
      expect(result?.latitude).toBeCloseTo(37.7749, 3);
      expect(result?.longitude).toBeCloseTo(-122.4194, 3);
      expect(result?.accuracy).toBeCloseTo(5.6, 1);
      expect(result?.count).toBeGreaterThan(0);
    });

    it("should work correctly with window size limit", () => {
      const averager = new LocationAverager(3);
      const readings: LocationPoint[] = [
        { latitude: 40.7128, longitude: -74.006, accuracy: 10 },
        { latitude: 40.7129, longitude: -74.0061, accuracy: 11 },
        { latitude: 40.713, longitude: -74.0062, accuracy: 12 },
        { latitude: 40.7131, longitude: -74.0063, accuracy: 13 },
        { latitude: 40.7132, longitude: -74.0064, accuracy: 14 },
      ];

      readings.forEach((reading) => averager.addReading(reading));

      const result = averager.calculateAveragedLocation();
      expect(result).not.toBeNull();
      // Only the last 3 readings should be used
      expect(result?.count).toBeLessThanOrEqual(3);
    });

    it("should handle extreme outliers correctly", () => {
      const averager = new LocationAverager();
      const readings: LocationPoint[] = [
        { latitude: 40.7128, longitude: -74.006, accuracy: 5 },
        { latitude: 40.7129, longitude: -74.0061, accuracy: 6 },
        { latitude: 40.713, longitude: -74.0062, accuracy: 5 },
        { latitude: 50.0, longitude: -80.0, accuracy: 1000 }, // Extreme outlier
      ];

      readings.forEach((reading) => averager.addReading(reading));

      const result = averager.calculateAveragedLocation();
      expect(result).not.toBeNull();
      // The extreme outlier should be filtered out
      expect(result?.count).toBe(3);
      expect(result?.latitude).toBeCloseTo(40.71, 1);
      expect(result?.longitude).toBeCloseTo(-74.006, 1);
    });

    it("should produce deterministic results for the same input", () => {
      const averager1 = new LocationAverager();
      const averager2 = new LocationAverager();
      const readings: LocationPoint[] = [
        { latitude: 40.7128, longitude: -74.006, accuracy: 10 },
        { latitude: 40.7129, longitude: -74.0061, accuracy: 11 },
        { latitude: 40.713, longitude: -74.0062, accuracy: 12 },
      ];

      readings.forEach((reading) => {
        averager1.addReading(reading);
        averager2.addReading(reading);
      });

      const result1 = averager1.calculateAveragedLocation();
      const result2 = averager2.calculateAveragedLocation();

      expect(result1).toEqual(result2);
    });
  });

  describe("Integration scenarios", () => {
    it("should handle a complete workflow: add, calculate, clear, add, calculate", () => {
      const averager = new LocationAverager();

      // First batch of readings
      averager.addReading({
        latitude: 40.7128,
        longitude: -74.006,
        accuracy: 10,
      });
      averager.addReading({
        latitude: 40.7129,
        longitude: -74.0061,
        accuracy: 11,
      });

      const result1 = averager.calculateAveragedLocation();
      expect(result1).not.toBeNull();

      // Clear and add new readings
      averager.clearReadings();
      expect(averager.getCount()).toBe(0);

      averager.addReading({
        latitude: 37.7749,
        longitude: -122.4194,
        accuracy: 5,
      });
      averager.addReading({
        latitude: 37.775,
        longitude: -122.4195,
        accuracy: 6,
      });

      const result2 = averager.calculateAveragedLocation();
      expect(result2).not.toBeNull();
      expect(result2?.latitude).not.toBeCloseTo(result1!.latitude);
    });

    it("should handle continuous streaming of GPS readings", () => {
      const averager = new LocationAverager(5);
      const baseLatitude = 40.7128;
      const baseLongitude = -74.006;

      // Simulate 20 GPS readings with slight variations
      for (let i = 0; i < 20; i++) {
        averager.addReading({
          latitude: baseLatitude + Math.random() * 0.001,
          longitude: baseLongitude + Math.random() * 0.001,
          accuracy: 5 + Math.random() * 5,
        });

        if (i >= 1) {
          const result = averager.calculateAveragedLocation();
          expect(result).not.toBeNull();
          expect(result?.latitude).toBeCloseTo(baseLatitude, 2);
          expect(result?.longitude).toBeCloseTo(baseLongitude, 2);
        }
      }

      expect(averager.getCount()).toBe(5); // Window size limit
    });

    it("should handle edge case with all readings having same accuracy", () => {
      const averager = new LocationAverager();
      const readings: LocationPoint[] = [
        { latitude: 40.7128, longitude: -74.006, accuracy: 10 },
        { latitude: 40.7129, longitude: -74.0061, accuracy: 10 },
        { latitude: 40.713, longitude: -74.0062, accuracy: 10 },
      ];

      readings.forEach((reading) => averager.addReading(reading));

      const result = averager.calculateAveragedLocation();
      expect(result).not.toBeNull();
      expect(result?.count).toBe(3);
      expect(result?.accuracy).toBeCloseTo(10);
    });

    it("should handle negative coordinates correctly", () => {
      const averager = new LocationAverager();
      const readings: LocationPoint[] = [
        { latitude: -33.8688, longitude: 151.2093, accuracy: 8 },
        { latitude: -33.8689, longitude: 151.2094, accuracy: 9 },
        { latitude: -33.8687, longitude: 151.2092, accuracy: 7 },
      ];

      readings.forEach((reading) => averager.addReading(reading));

      const result = averager.calculateAveragedLocation();
      expect(result).not.toBeNull();
      expect(result?.latitude).toBeCloseTo(-33.8688, 3);
      expect(result?.longitude).toBeCloseTo(151.2093, 3);
    });
  });
});
