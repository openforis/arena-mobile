export enum PositionTrackingStatus {
  idle = "idle",
  starting = "starting",
  tracking = "tracking",
  paused = "paused",
}

export type PositionTrackingState = {
  status: PositionTrackingStatus;
  recordUuid: string | null;
  nodeUuid: string | null;
  length: number;
  pointsCount: number;
  lastAccuracy: number | null;
  lastFixTime: number | null;
  durationMs: number;
  currentSegmentLastPointTime: number | null;
  // i18n key of the last error (e.g. location permission denied)
  errorKey: string | null;
};
