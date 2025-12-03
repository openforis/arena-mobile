import { AveragedLocation, LocationPoint } from "model";

// --- Configuration Constants ---

const SD_MULTIPLIER = 2; // Default 2 Standard Deviations for outlier exclusion
const DEFAULT_WINDOW_SIZE = 10; // Default size for the observation window

const madScaleFactor = 1.4826; // constant to make MAD consistent with SD for normal distributions

/**
 * Stores a fixed "window" of the most recent LocationPoint objects, filters outliers
 * using Median Absolute Deviation (MAD) of accuracy, and calculates the final averaged location.
 */
export class LocationAverager {
  private readings: LocationPoint[] = [];

  /**
   * Initializes the averager with the statistical multiplier and window size.
   * @param maxWindowSize - The maximum number of recent readings to store (the size of the observation window).
   * @param sdMultiplier - The multiplier to use with MAD for the exclusion threshold (N*MAD).
   */
  constructor(
    private readonly maxWindowSize: number = DEFAULT_WINDOW_SIZE,
    private readonly sdMultiplier: number = SD_MULTIPLIER
  ) {
    if (this.maxWindowSize < 1) {
      throw new Error("maxWindowSize must be at least 1.");
    }
  }

  /**
   * Adds a new location reading to the internal store, maintaining the fixed window size.
   * If the window is full, the oldest reading is removed (FIFO).
   * @param locationPoint - The LocationPoint object to store.
   */
  public addReading(locationPoint: LocationPoint): void {
    this.readings.push(locationPoint);

    // Enforce the window size (FIFO logic)
    if (this.readings.length > this.maxWindowSize) {
      // Remove the oldest reading (first element)
      this.readings.shift();
    }
  }

  /**
   * Returns the current number of stored readings in the window.
   * @returns The number of readings currently stored.
   */
  public getCount(): number {
    return this.readings.length;
  }

  /**
   * Clears all stored readings, resetting the averager.
   */
  public clearReadings(): void {
    this.readings = [];
  }

  // --- Calculation Logic ---

  /**
   * Calculates the final averaged location after filtering out accuracy outliers
   * using the Median Absolute Deviation (MAD) method, which is more robust to extreme outliers.
   * @returns The AveragedLocation object or null if not enough data is present.
   */
  public calculateAveragedLocation(): AveragedLocation | null {
    const readings = this.readings;

    // We need at least 2 points to calculate statistics reliably.
    if (readings.length < 2) return null;

    // --- 1. Extract and sort accuracy values ---
    const accuracyValues: number[] = readings
      .map((locationPoint) => locationPoint.accuracy ?? 0) // Treat null accuracy as 0
      .sort((a, b) => a - b);

    // --- 2. Calculate Median Accuracy ---
    const median = calculateMedian(accuracyValues);

    // --- 3. Calculate Median Absolute Deviation (MAD) ---
    const absoluteDeviations = accuracyValues
      .map((acc) => Math.abs(acc - median))
      .sort((a, b) => a - b);
    const mad = calculateMedian(absoluteDeviations);

    // --- 4. Determine Exclusion Threshold using Modified Z-score ---
    // Modified Z-score = 0.6745 * (value - median) / MAD
    // Typically, values with modified Z-score > 3.5 are considered outliers
    // This translates to: |value - median| > 3.5 * MAD / 0.6745 ≈ 5.19 * MAD
    // We'll use a threshold of median + sdMultiplier * madScaleFactor * MAD
    const accuracyThreshold = median + this.sdMultiplier * madScaleFactor * mad;

    // --- 5. Filter Outliers ---
    const filteredReadings = readings.filter(
      (coord) => coord.accuracy !== null && coord.accuracy <= accuracyThreshold
    );

    if (filteredReadings.length === 0) {
      // All readings were excluded as outliers
      return null;
    }

    // --- 6. Average the remaining (filtered) coordinates ---
    const finalTotal = {
      latitude: 0,
      longitude: 0,
      accuracy: 0,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    };
    for (const filteredReading of filteredReadings) {
      finalTotal.latitude += filteredReading.latitude;
      finalTotal.longitude += filteredReading.longitude;
      finalTotal.accuracy += filteredReading.accuracy!;
      addPropertyFromSource(finalTotal, filteredReading, "altitude");
      addPropertyFromSource(finalTotal, filteredReading, "altitudeAccuracy");
      addPropertyFromSource(finalTotal, filteredReading, "heading");
      addPropertyFromSource(finalTotal, filteredReading, "speed");
    }

    const count = filteredReadings.length;

    return {
      latitude: finalTotal.latitude / count,
      longitude: finalTotal.longitude / count,
      accuracy: finalTotal.accuracy / count,
      altitude:
        finalTotal.altitude === null ? null : finalTotal.altitude / count,
      altitudeAccuracy:
        finalTotal.altitudeAccuracy === null
          ? null
          : finalTotal.altitudeAccuracy / count,
      heading: finalTotal.heading === null ? null : finalTotal.heading / count,
      speed: finalTotal.speed === null ? null : finalTotal.speed / count,
      count,
    };
  }
}

const addPropertyFromSource = (target: any, source: any, property: string) => {
  const targetValue = target[property];
  const sourceValue = source[property];
  if (targetValue === undefined || targetValue === null) {
    target[property] = sourceValue;
  } else if (sourceValue !== undefined && sourceValue !== null) {
    target[property] += sourceValue;
  }
};

// --- Helper Methods ---
/**
 * Calculates the median of a sorted array of numbers.
 * @param sortedValues - An array of numbers sorted in ascending order.
 * @returns The median value.
 */
const calculateMedian = (sortedValues: number[]): number => {
  const length = sortedValues.length;
  if (length === 0) return 0;

  const midIndex = Math.floor(length / 2);
  const midValue = sortedValues[midIndex]!;
  return length % 2 === 0
    ? // Even number of elements: average the two middle values
      (sortedValues[midIndex - 1]! + midValue) / 2
    : // Odd number of elements: return the middle value
      midValue;
};
