import { PositionTrackingService } from "./PositionTrackingService";
import { PositionTrackingLocationSource } from "./positionTrackingLocationSource";
import { PositionTrackRepository } from "../repository/positionTrackRepository";

jest.mock("../../utils", () => ({
  log: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

jest.mock("../../model", () => ({
  PositionTracks:
    jest.requireActual("../../model/utils/PositionTracks").PositionTracks,
}));

jest.mock("../repository/positionTrackRepository", () => ({
  PositionTrackStatus: { tracking: "tracking", paused: "paused" },
  PositionTrackRepository: {
    insertTrack: jest.fn(async (params: any) => ({
      ...params,
      id: 1,
      status: "tracking",
    })),
    insertPoint: jest.fn(async () => {}),
    updateTrackStatus: jest.fn(async () => {}),
    fetchSegments: jest.fn(async () => []),
    deleteTrack: jest.fn(async () => {}),
  },
}));

jest.mock("./positionTrackingLocationSource", () => ({
  PositionTrackingLocationSource: { watchPosition: jest.fn() },
}));

const watchPositionMock =
  PositionTrackingLocationSource.watchPosition as jest.Mock;

const settings = {
  accuracyThreshold: 20,
  batterySaver: false,
  minDistance: 3,
  preferredGpsSourceId: "internal",
};

// ~11 m per step
const latStep = 0.0001;

let emitLocation: (location: any) => void = () => {};
const subscriptionRemove = jest.fn();
let now = Date.parse("2026-10-15T08:00:00Z");

// every location is received 10 seconds after the previous one (walking speed)
const emit = (latitude: number, accuracy = 3) => {
  now += 10000;
  emitLocation({ latitude, longitude: 0, accuracy, altitude: null });
};

const startTracking = (baseValue: any = null) =>
  PositionTrackingService.start({
    surveyId: 1,
    recordUuid: "record-1",
    nodeUuid: "node-1",
    baseValue,
    settings,
  });

describe("PositionTrackingService", () => {
  beforeAll(() => {
    jest.spyOn(Date, "now").mockImplementation(() => now);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await PositionTrackingService.unload();
    watchPositionMock.mockImplementation(async ({ onLocation }: any) => {
      emitLocation = onLocation;
      return { remove: subscriptionRemove };
    });
  });

  test("records accepted points and stores them", async () => {
    await startTracking();
    emit(0);
    emit(latStep / 10); // too close
    emit(latStep, 50); // inaccurate
    emit(latStep);
    emit(2 * latStep);

    // 3 points recorded, the middle one is dropped by the simplification
    expect(PositionTrackingService.getStats().pointsCount).toBe(2);
    await PositionTrackingService.pause();
    expect(PositionTrackRepository.insertPoint).toHaveBeenCalledTimes(3);
    expect(subscriptionRemove).toHaveBeenCalled();

    const value = PositionTrackingService.buildValue()!;
    expect(value.geometry.coordinates).toHaveLength(1);
    // the middle point is on the straight line: dropped by the simplification
    expect(value.geometry.coordinates[0]).toHaveLength(2);
  });

  test("resuming starts a new segment", async () => {
    await startTracking();
    emit(0);
    emit(latStep);
    await PositionTrackingService.pause();
    emit(5 * latStep); // ignored while paused
    await PositionTrackingService.resume(settings);
    emit(10 * latStep);
    emit(11 * latStep);

    const value = PositionTrackingService.buildValue()!;
    expect(value.geometry.coordinates).toHaveLength(2);
    expect(value.properties.pointsCount).toBe(4);
  });

  test("appends the new segments to the existing value", async () => {
    await startTracking();
    emit(0);
    emit(latStep);
    const firstValue = PositionTrackingService.buildValue();
    await PositionTrackingService.discard();

    await startTracking(firstValue);
    emit(20 * latStep);
    emit(21 * latStep);
    const value = PositionTrackingService.buildValue()!;
    expect(value.geometry.coordinates).toHaveLength(2);
    expect(PositionTrackRepository.deleteTrack).toHaveBeenCalledWith(1);
  });

  test("battery saver: location updates every min distance", async () => {
    await PositionTrackingService.start({
      surveyId: 1,
      recordUuid: "record-1",
      nodeUuid: "node-1",
      baseValue: null,
      settings: { ...settings, batterySaver: true, minDistance: 10 },
    });
    expect(watchPositionMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ batterySaver: true, distanceInterval: 10 }),
    );
  });

  test("removes the stored track when the location source cannot start", async () => {
    watchPositionMock.mockRejectedValueOnce(new Error("permission denied"));
    await expect(startTracking()).rejects.toThrow("permission denied");
    expect(PositionTrackRepository.deleteTrack).toHaveBeenCalledWith(1);
    expect(PositionTrackingService.getTrack()).toBeNull();
  });
});
