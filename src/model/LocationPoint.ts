export type LocationPoint = {
  latitude: number;
  longitude: number;
  accuracy: number | null; // Accuracy in meters, can be null if not available
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
};

export type AveragedLocation = LocationPoint & {
  accuracy: number; // The average accuracy of the filtered readings
  count: number; // Number of readings used in the final average
};
