export type LocationPoint = {
  latitude: number;
  longitude: number;
  accuracy: number | null; // Accuracy in meters, can be null if not available
};

export type AveragedLocation = LocationPoint & {
  accuracy: number; // The average accuracy of the filtered readings
  count: number; // Number of readings used in the final average
};
