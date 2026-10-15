import {
  LocationPoint,
  PositionTracks,
  TrackFeature,
  TrackPoint,
  TrackSegment,
} from "model";
import { log } from "utils";

import {
  PositionTrack,
  PositionTrackRepository,
  PositionTrackStatus,
} from "../repository/positionTrackRepository";
import { PositionTrackingLocationSource } from "./positionTrackingLocationSource";

export type PositionTrackingSettings = {
  accuracyThreshold: number;
  minDistance: number;
  preferredGpsSourceId: string;
};

export type PositionTrackingStats = {
  length: number;
  pointsCount: number;
  lastAccuracy: number | null;
  lastFixTime: number | null;
  // millis, computed from the time of the recorded points
  durationMs: number;
  // time of the last point recorded in the segment being recorded (if any)
  currentSegmentLastPointTime: number | null;
};

type Listener = () => void;

// the current track lives outside of the store: the location callbacks keep running while the
// user moves between pages of the record
let track: PositionTrack | null = null;
let segments: TrackSegment[] = [];
let subscription: { remove: () => void } | null = null;
let lastAccuracy: number | null = null;
let lastFixTime: number | null = null;
// segments already stored in the attribute when the track was started
let baseSegments: TrackSegment[] = [];
// points are written one after the other, in the order they are received
let pointsWriteQueue: Promise<void> = Promise.resolve();
// incremented every time the segments change (used by useSyncExternalStore)
let version = 0;
const listeners = new Set<Listener>();

const notify = () => {
  version += 1;
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getVersion = () => version;

const getTrack = () => track;

const getSegments = () => segments;

const isWatching = () => subscription !== null;

// segment durations, in millis
const computeDuration = (segmentsToSum: TrackSegment[]) =>
  segmentsToSum.reduce(
    (acc, segment) =>
      segment.length > 1 ? acc + segment.at(-1)!.time - segment[0]!.time : acc,
    0,
  );

// stats of the whole track (existing value + new segments)
const getStats = (): PositionTrackingStats => {
  const allSegments = [...baseSegments, ...segments];
  return {
    length: PositionTracks.computeLength(allSegments),
    pointsCount: PositionTracks.countPoints(allSegments),
    lastAccuracy,
    lastFixTime,
    durationMs: computeDuration(allSegments),
    currentSegmentLastPointTime: subscription
      ? (segments.at(-1)?.at(-1)?.time ?? null)
      : null,
  };
};

const onLocation =
  (settings: PositionTrackingSettings) => (location: LocationPoint) => {
    const currentTrack = track;
    if (!currentTrack || !subscription) return;

    const point: TrackPoint = {
      latitude: location.latitude,
      longitude: location.longitude,
      altitude: location.altitude ?? null,
      accuracy: location.accuracy ?? null,
      time: Date.now(),
    };
    lastAccuracy = point.accuracy ?? null;
    lastFixTime = point.time;

    const segmentIndex = segments.length - 1;
    const segment = segments[segmentIndex]!;
    const rejectReason = PositionTracks.evaluatePoint({
      point,
      lastPoint: segment.at(-1),
      accuracyThreshold: settings.accuracyThreshold,
      minDistance: settings.minDistance,
    });
    if (rejectReason) {
      notify();
      return;
    }
    segment.push(point);
    pointsWriteQueue = pointsWriteQueue
      .then(() =>
        PositionTrackRepository.insertPoint({
          trackId: currentTrack.id,
          segmentIndex,
          point,
        }),
      )
      .catch((error) =>
        log.error("PositionTracking: error storing track point", error),
      );
    notify();
  };

const startWatching = async (settings: PositionTrackingSettings) => {
  // a new segment is started every time tracking is started or resumed
  segments = [...segments, []];
  subscription = await PositionTrackingLocationSource.watchPosition({
    preferredGpsSourceId: settings.preferredGpsSourceId,
    distanceInterval: Math.max(1, settings.minDistance / 2),
    onLocation: onLocation(settings),
  });
  notify();
};

const stopWatching = async () => {
  subscription?.remove();
  subscription = null;
  // drop the last segment if no point has been recorded in it
  if (segments.at(-1)?.length === 0) {
    segments = segments.slice(0, -1);
  }
  await pointsWriteQueue;
  notify();
};

const reset = () => {
  subscription?.remove();
  subscription = null;
  track = null;
  segments = [];
  baseSegments = [];
  lastAccuracy = null;
  lastFixTime = null;
  notify();
};

const start = async ({
  surveyId,
  recordUuid,
  nodeUuid,
  baseValue,
  settings,
}: {
  surveyId: number;
  recordUuid: string;
  nodeUuid: string;
  baseValue: any;
  settings: PositionTrackingSettings;
}) => {
  reset();
  track = await PositionTrackRepository.insertTrack({
    surveyId,
    recordUuid,
    nodeUuid,
    baseValue,
  });
  baseSegments = PositionTracks.fromFeature(baseValue);
  try {
    await startWatching(settings);
  } catch (error) {
    // e.g. location permission denied
    await PositionTrackRepository.deleteTrack(track.id);
    reset();
    throw error;
  }
  log.info(`PositionTracking: started tracking node ${nodeUuid}`);
  return track;
};

// loads a track stored in the DB (e.g. after the app has been closed while tracking)
const load = async (trackToLoad: PositionTrack) => {
  reset();
  track = { ...trackToLoad, status: PositionTrackStatus.paused };
  baseSegments = PositionTracks.fromFeature(trackToLoad.baseValue);
  segments = await PositionTrackRepository.fetchSegments(trackToLoad.id);
  if (trackToLoad.status !== PositionTrackStatus.paused) {
    await PositionTrackRepository.updateTrackStatus({
      id: trackToLoad.id,
      status: PositionTrackStatus.paused,
    });
  }
  notify();
  return track;
};

const pause = async () => {
  if (!track) return;
  await stopWatching();
  track = { ...track, status: PositionTrackStatus.paused };
  await PositionTrackRepository.updateTrackStatus({
    id: track.id,
    status: track.status,
  });
  log.info("PositionTracking: paused");
};

const resume = async (settings: PositionTrackingSettings) => {
  if (!track || isWatching()) return;
  try {
    await startWatching(settings);
  } catch (error) {
    await stopWatching();
    throw error;
  }
  track = { ...track, status: PositionTrackStatus.tracking };
  await PositionTrackRepository.updateTrackStatus({
    id: track.id,
    status: track.status,
  });
  log.info("PositionTracking: resumed");
};

// value of the tracked attribute: segments already in it when tracking started + new segments
const buildValue = (): TrackFeature | null => {
  if (!track) return null;
  return PositionTracks.toFeature([...baseSegments, ...segments]);
};

// removes the track from the DB: to be called once its points are stored in the attribute value
const discard = async () => {
  const trackId = track?.id;
  await stopWatching();
  reset();
  if (trackId !== undefined) {
    await PositionTrackRepository.deleteTrack(trackId);
  }
};

// stops watching but keeps the track in the DB
const unload = async () => {
  await stopWatching();
  reset();
};

export const PositionTrackingService = {
  subscribe,
  getVersion,
  getTrack,
  getSegments,
  getStats,
  isWatching,
  start,
  load,
  pause,
  resume,
  buildValue,
  discard,
  unload,
  fetchTrackByRecordUuid: PositionTrackRepository.fetchTrackByRecordUuid,
  deleteTracksByRecordUuids: PositionTrackRepository.deleteTracksByRecordUuids,
};
