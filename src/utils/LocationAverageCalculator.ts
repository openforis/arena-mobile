// --- Type Definitions ---
export type LocationPoint = {
  latitude: number;
  longitude: number;
  accuracy: number | null; // Accuracy in meters, can be null if not available
};

export type AveragedLocation = LocationPoint & {
  accuracy: number; // The average accuracy of the filtered readings
  count: number; // Number of readings used in the final average
};

// --- Configuration Constants ---

const SD_MULTIPLIER = 2; // Default 2 Standard Deviations for outlier exclusion
const DEFAULT_WINDOW_SIZE = 10; // Default size for the observation window

/**
 * Stores a fixed "window" of the most recent LocationCoords, filters outliers
 * using Standard Deviation (SD) of accuracy, and calculates the final averaged location.
 */
export class LocationAverager {
  private readings: LocationPoint[] = [];

  /**
   * Initializes the averager with the statistical multiplier and window size.
   * @param maxWindowSize - The maximum number of recent readings to store (the size of the observation window).
   * @param sdMultiplier - The number of standard deviations (N) to use for the exclusion rule (N*SD).
   */
  constructor(
    private maxWindowSize: number = DEFAULT_WINDOW_SIZE,
    private sdMultiplier: number = SD_MULTIPLIER
  ) {
    if (this.maxWindowSize < 1) {
      throw new Error("maxWindowSize must be at least 1.");
    }
  }

  /**
   * Adds a new location reading to the internal store, maintaining the fixed window size.
   * If the window is full, the oldest reading is removed (FIFO).
   * @param coord The LocationCoords object to store.
   */
  public addReading(coord: LocationPoint): void {
    this.readings.push(coord);

    // Enforce the window size (FIFO logic)
    if (this.readings.length > this.maxWindowSize) {
      // Remove the oldest reading (first element)
      this.readings.shift();
    }
  }

  /**
   * Returns the current number of stored readings in the window.
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
      .map((coord) => coord.accuracy ?? 0)
      .sort((a, b) => a - b);
    console.log("===Accuracy Values (sorted):", accuracyValues);

    // --- 2. Calculate Median Accuracy ---
    const median = this.calculateMedian(accuracyValues);
    console.log("===Median Accuracy:", median);

    // --- 3. Calculate Median Absolute Deviation (MAD) ---
    const absoluteDeviations = accuracyValues
      .map((acc) => Math.abs(acc - median))
      .sort((a, b) => a - b);
    const mad = this.calculateMedian(absoluteDeviations);
    console.log("===MAD:", mad);

    // --- 4. Determine Exclusion Threshold using Modified Z-score ---
    // Modified Z-score = 0.6745 * (value - median) / MAD
    // Typically, values with modified Z-score > 3.5 are considered outliers
    // This translates to: |value - median| > 3.5 * MAD / 0.6745 ≈ 5.19 * MAD
    // We'll use a threshold of median + sdMultiplier * 1.4826 * MAD
    // (1.4826 is the constant to make MAD consistent with SD for normal distributions)
    const madScaledToSD = 1.4826 * mad;
    const accuracyThreshold = median + this.sdMultiplier * madScaledToSD;
    console.log("===Accuracy Threshold:", accuracyThreshold);

    // --- 5. Filter Outliers ---
    const filteredReadings = readings.filter(
      (coord) => coord.accuracy !== null && coord.accuracy <= accuracyThreshold
    );
    console.log("===Filtered Readings:", filteredReadings);

    if (filteredReadings.length === 0) {
      // All readings were excluded as outliers
      return null;
    }

    // --- 5. Average the remaining (filtered) coordinates ---
    const finalTotal = filteredReadings.reduce(
      (acc, coord) => {
        acc.latitude += coord.latitude;
        acc.longitude += coord.longitude;
        acc.accuracy! += coord.accuracy!; // accuracy is guaranteed non-null here
        return acc;
      },
      { latitude: 0, longitude: 0, accuracy: 0 }
    );

    const count = filteredReadings.length;
    console.log("===Count of Filtered Readings:", count);

    const result = {
      latitude: finalTotal.latitude / count,
      longitude: finalTotal.longitude / count,
      accuracy: finalTotal.accuracy! / count,
      count,
    };
    console.log("===Averaged Location Result:", result);
    return result;
  }

  /**
   * Calculates the median of a sorted array of numbers.
   * @param sortedValues An array of numbers sorted in ascending order.
   * @returns The median value.
   */
  private calculateMedian(sortedValues: number[]): number {
    const length = sortedValues.length;
    if (length === 0) return 0;

    const midIndex = Math.floor(length / 2);
    const midValue = sortedValues[midIndex]!;
    return length % 2 === 0
      ? // Even number of elements: average the two middle values
        (sortedValues[midIndex - 1]! + midValue) / 2
      : // Odd number of elements: return the middle value
        midValue;
  }
}
