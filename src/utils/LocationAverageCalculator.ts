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
   * using the N * Standard Deviation rule on the current window of readings.
   * @returns The AveragedLocation object or null if not enough data is present.
   */
  public calculateAveragedLocation(): AveragedLocation | null {
    const readings = this.readings;

    // We need at least 2 points to calculate standard deviation reliably.
    if (readings.length < 2) return null;

    // --- 1. Calculate Mean Accuracy ---
    const accuracyValues: number[] = readings.map(
      (coord) => coord.accuracy ?? 0
    );
    const sumAccuracy: number = accuracyValues.reduce(sumReducer, 0);
    const meanAccuracy = sumAccuracy / readings.length;

    // --- 2. Calculate Standard Deviation ($\sigma$) of Accuracy ---
    const squaredDifferences = accuracyValues.map((acc) =>
      Math.pow(acc - meanAccuracy, 2)
    );
    const variance = squaredDifferences.reduce(sumReducer, 0) / readings.length;
    const standardDeviation = Math.sqrt(variance);

    // --- 3. Determine Exclusion Threshold  ---
    const accuracyThreshold =
      meanAccuracy + this.sdMultiplier * standardDeviation;

    // --- 4. Filter Outliers ---
    const filteredReadings = readings.filter(
      (coord) => coord.accuracy !== null && coord.accuracy <= accuracyThreshold
    );

    if (filteredReadings.length === 0) {
      console.warn("All readings were excluded as outliers.");
      return null;
    }

    // --- 5. Average the remaining (filtered) coordinates ---
    const finalTotal = filteredReadings.reduce(
      (acc, coord) => {
        acc.latitude += coord.latitude;
        acc.longitude += coord.longitude;
        acc.accuracy += coord.accuracy!; // accuracy is guaranteed non-null here
        return acc;
      },
      { latitude: 0, longitude: 0, accuracy: 0 }
    );

    const count = filteredReadings.length;

    return {
      latitude: finalTotal.latitude / count,
      longitude: finalTotal.longitude / count,
      accuracy: finalTotal.accuracy / count,
      count,
    };
  }
}

// --- Helper Functions ---

const sumReducer = (accumulator: number, currentValue: number) =>
  accumulator + currentValue;
