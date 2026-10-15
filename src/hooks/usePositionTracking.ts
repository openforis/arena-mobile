import { useEffect, useState, useSyncExternalStore } from "react";

import { PositionTracks, TrackSegment } from "model";
import { PositionTrackingService } from "service/positionTracking";
import {
  PositionTrackingSelectors,
  PositionTrackingStatus,
} from "state/positionTracking";

// no location received for this long while tracking: show "waiting for GPS"
const WAITING_FOR_FIX_THRESHOLD_MS = 10000;
const TICK_INTERVAL_MS = 1000;

const useNow = (active: boolean) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!active) return undefined;
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), TICK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [active]);
  return now;
};

// all the segments of the track being recorded (updated on every new point)
export const usePositionTrackingLiveSegments = (): TrackSegment[] =>
  useSyncExternalStore(
    PositionTrackingService.subscribe,
    PositionTrackingService.getAllSegments,
  );

export const usePositionTrackingSummary = () => {
  const trackingState = PositionTrackingSelectors.usePositionTrackingState();
  const {
    status,
    length,
    pointsCount,
    lastAccuracy,
    lastFixTime,
    durationMs,
    currentSegmentLastPointTime,
  } = trackingState;
  const tracking = status === PositionTrackingStatus.tracking;
  const now = useNow(tracking);

  const liveDurationMs =
    durationMs +
    (tracking && currentSegmentLastPointTime
      ? Math.max(0, now - currentSegmentLastPointTime)
      : 0);

  const waitingForFix =
    tracking &&
    (lastFixTime === null || now - lastFixTime > WAITING_FOR_FIX_THRESHOLD_MS);

  return {
    ...trackingState,
    tracking,
    waitingForFix,
    lengthText: PositionTracks.formatLength(length),
    durationText: PositionTracks.formatDuration(liveDurationMs),
    accuracyText:
      lastAccuracy === null || lastAccuracy === undefined
        ? null
        : String(Math.round(lastAccuracy)),
    pointsCount,
  };
};
