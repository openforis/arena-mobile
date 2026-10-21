import { configureStore } from "@reduxjs/toolkit";

import { PositionTrackingActions } from "./actions";
import { PositionTrackingReducer } from "./reducer";
import { PositionTrackingStatus } from "./types";

const trackValue = {
  type: "Feature",
  properties: {},
  geometry: {
    type: "MultiLineString",
    coordinates: [
      [
        [0, 0],
        [0, 0.0001],
      ],
    ],
  },
};

const mockService = {
  track: null as any,
  watching: false,
  startError: null as Error | null,
};

jest.mock("utils", () => ({
  log: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
  SystemUtils: { setKeepScreenAwake: jest.fn(async () => {}) },
}));

jest.mock("model", () => ({
  GpsSourceSetting: { auto: "auto" },
  PositionTracks: jest.requireActual("model/utils/PositionTracks")
    .PositionTracks,
}));

jest.mock("service/positionTracking", () => {
  class LocationSourceError extends Error {
    key: string;
    constructor(key: string) {
      super(key);
      this.key = key;
    }
  }
  return {
    LocationSourceError,
    PositionTrackStatus: { tracking: "tracking", paused: "paused" },
    PositionTrackingService: {
      subscribe: jest.fn(() => () => {}),
      getStats: jest.fn(() => ({
        length: 11,
        pointsCount: 2,
        lastAccuracy: 3,
        lastFixTime: null,
        durationMs: 0,
        currentSegmentLastPointTime: null,
      })),
      getTrack: jest.fn(() => mockService.track),
      isWatching: jest.fn(() => mockService.watching),
      start: jest.fn(async ({ recordUuid, nodeUuid }: any) => {
        if (mockService.startError) throw mockService.startError;
        mockService.track = { id: 1, recordUuid, nodeUuid };
        mockService.watching = true;
      }),
      pause: jest.fn(async () => {
        mockService.watching = false;
      }),
      resume: jest.fn(async () => {
        mockService.watching = true;
      }),
      buildValue: jest.fn(() => trackValue),
      discard: jest.fn(async () => {
        mockService.track = null;
        mockService.watching = false;
      }),
      unload: jest.fn(async () => {
        mockService.track = null;
        mockService.watching = false;
      }),
      load: jest.fn(),
      fetchTrackByRecordUuid: jest.fn(async () => null),
      deleteTracksByRecordUuids: jest.fn(async () => {}),
    },
  };
});

const mockConfirm = jest.fn(async (): Promise<any> => ({}));
jest.mock("../confirm/utils", () => ({
  ConfirmUtils: { confirm: () => mockConfirm() },
}));

jest.mock("../toast", () => ({
  ToastActions: {
    show: (textKey: string) => ({ type: "TOAST_SHOW", textKey }),
  },
}));

jest.mock("../dataEntry/actions", () => ({
  DataEntryActions: {
    updateAttribute:
      ({ uuid, value }: any) =>
      (dispatch: any) =>
        dispatch({ type: "TEST_NODE_VALUE_SET", uuid, value }),
  },
}));

jest.mock("../dataEntry/selectors", () => ({
  DataEntrySelectors: {
    selectRecordUnsafe: (state: any) => state.dataEntry.record,
    selectRecord: (state: any) => state.dataEntry.record,
    selectCanEditRecord: (state: any) => state.dataEntry.canEdit,
  },
}));

jest.mock("../settings/selectors", () => ({
  SettingsSelectors: { selectSettings: () => ({ keepScreenAwake: false }) },
}));

jest.mock("../survey/selectors", () => ({
  SurveySelectors: {
    selectCurrentSurvey: (state: any) => state.survey,
  },
}));

const trackDefUuid = "track-def";
const otherTrackDefUuid = "other-track-def";

const survey: any = {
  id: 1,
  nodeDefs: {
    root: { uuid: "root", type: "entity", props: { name: "root" } },
    [trackDefUuid]: {
      uuid: trackDefUuid,
      parentUuid: "root",
      type: "geo",
      props: { name: "track", positionTracking: true },
    },
    [otherTrackDefUuid]: {
      uuid: otherTrackDefUuid,
      parentUuid: "root",
      type: "geo",
      props: { name: "other_track", positionTracking: true },
    },
  },
};

const createRecord = () => ({
  uuid: "record-1",
  nodes: {
    "root-node": { uuid: "root-node", nodeDefUuid: "root" },
    "track-node": {
      uuid: "track-node",
      nodeDefUuid: trackDefUuid,
      parentUuid: "root-node",
    },
    "other-track-node": {
      uuid: "other-track-node",
      nodeDefUuid: otherTrackDefUuid,
      parentUuid: "root-node",
    },
  },
});

const dataEntryReducer = (
  state: any = { record: createRecord(), canEdit: true },
  action: any,
) => {
  if (action.type === "TEST_NODE_VALUE_SET") {
    const node = state.record.nodes[action.uuid];
    return {
      ...state,
      record: {
        ...state.record,
        nodes: {
          ...state.record.nodes,
          [action.uuid]: { ...node, value: action.value },
        },
      },
    };
  }
  if (action.type === "TEST_CAN_EDIT_SET") {
    return { ...state, canEdit: action.canEdit };
  }
  if (action.type === "TEST_RECORD_SET") {
    return { ...state, record: action.record };
  }
  return state;
};

const toastReducer = (state: string[] = [], action: any) =>
  action.type === "TOAST_SHOW" ? [...state, action.textKey] : state;

const createStore = () =>
  configureStore({
    reducer: {
      dataEntry: dataEntryReducer,
      positionTracking: PositionTrackingReducer,
      survey: () => survey,
      toasts: toastReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }),
  });

const getTrackedNodeValue = (store: any, nodeUuid = "track-node") =>
  store.getState().dataEntry.record.nodes[nodeUuid].value;

describe("PositionTrackingActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockService.track = null;
    mockService.watching = false;
    mockService.startError = null;
    mockConfirm.mockImplementation(async () => ({}));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("auto-start tracks the first trackable attribute of the new record", async () => {
    const store = createStore();
    await store.dispatch(PositionTrackingActions.autoStartTracking() as any);
    const state = store.getState().positionTracking;
    expect(state.status).toBe(PositionTrackingStatus.tracking);
    expect(state.nodeUuid).toBe("track-node");
    expect(state.pointsCount).toBe(2);
  });

  test("pausing writes the track into the attribute", async () => {
    const store = createStore();
    await store.dispatch(
      PositionTrackingActions.startTracking({ nodeUuid: "track-node" }) as any,
    );
    await store.dispatch(PositionTrackingActions.pauseTracking() as any);
    expect(store.getState().positionTracking.status).toBe(
      PositionTrackingStatus.paused,
    );
    expect(getTrackedNodeValue(store)).toEqual(trackValue);
  });

  test("the track is written into the attribute periodically", async () => {
    const store = createStore();
    await store.dispatch(
      PositionTrackingActions.startTracking({ nodeUuid: "track-node" }) as any,
    );
    expect(getTrackedNodeValue(store)).toBeUndefined();
    await jest.advanceTimersByTimeAsync(60000);
    expect(getTrackedNodeValue(store)).toEqual(trackValue);
    await store.dispatch(
      PositionTrackingActions.stopTracking({ confirm: false }) as any,
    );
  });

  test("stopping writes the track and removes it", async () => {
    const store = createStore();
    await store.dispatch(
      PositionTrackingActions.startTracking({ nodeUuid: "track-node" }) as any,
    );
    const stopped = await store.dispatch(
      PositionTrackingActions.stopTracking() as any,
    );
    expect(stopped).toBe(true);
    expect(getTrackedNodeValue(store)).toEqual(trackValue);
    expect(store.getState().positionTracking.status).toBe(
      PositionTrackingStatus.idle,
    );
    expect(mockService.track).toBeNull();
  });

  test("stopping is cancelled when not confirmed", async () => {
    const store = createStore();
    await store.dispatch(
      PositionTrackingActions.startTracking({ nodeUuid: "track-node" }) as any,
    );
    mockConfirm.mockImplementation(async () => null);
    await store.dispatch(PositionTrackingActions.stopTracking() as any);
    expect(store.getState().positionTracking.status).toBe(
      PositionTrackingStatus.tracking,
    );
    await store.dispatch(
      PositionTrackingActions.stopTracking({ confirm: false }) as any,
    );
  });

  test("the track is kept when it cannot be written into the attribute", async () => {
    const store = createStore();
    await store.dispatch(
      PositionTrackingActions.startTracking({ nodeUuid: "track-node" }) as any,
    );
    // another record open
    store.dispatch({
      type: "TEST_RECORD_SET",
      record: { ...createRecord(), uuid: "record-2" },
    });
    const stopped = await store.dispatch(
      PositionTrackingActions.stopTracking({ confirm: false }) as any,
    );
    expect(stopped).toBe(false);
    expect(mockService.track).not.toBeNull();
    expect(store.getState().positionTracking.status).toBe(
      PositionTrackingStatus.paused,
    );
    expect(store.getState().toasts).toEqual([
      "dataEntry:positionTracking.error.notSaved",
    ]);
  });

  test("only one track at a time: the current one is stopped after confirmation", async () => {
    const store = createStore();
    await store.dispatch(
      PositionTrackingActions.startTracking({ nodeUuid: "track-node" }) as any,
    );
    await store.dispatch(
      PositionTrackingActions.startTracking({
        nodeUuid: "other-track-node",
      }) as any,
    );
    expect(mockConfirm).toHaveBeenCalledTimes(1);
    expect(getTrackedNodeValue(store)).toEqual(trackValue);
    expect(store.getState().positionTracking.nodeUuid).toBe("other-track-node");
    await store.dispatch(
      PositionTrackingActions.stopTracking({ confirm: false }) as any,
    );
  });

  test("tracking is not started when the record cannot be edited", async () => {
    const store = createStore();
    store.dispatch({ type: "TEST_CAN_EDIT_SET", canEdit: false });
    await store.dispatch(
      PositionTrackingActions.startTracking({ nodeUuid: "track-node" }) as any,
    );
    expect(store.getState().positionTracking.status).toBe(
      PositionTrackingStatus.idle,
    );
  });

  test("start errors are shown", async () => {
    const { LocationSourceError } = jest.requireMock(
      "service/positionTracking",
    );
    mockService.startError = new LocationSourceError(
      "dataEntry:positionTracking.error.permissionDenied",
    );
    const store = createStore();
    await store.dispatch(
      PositionTrackingActions.startTracking({ nodeUuid: "track-node" }) as any,
    );
    const state = store.getState().positionTracking;
    expect(state.status).toBe(PositionTrackingStatus.idle);
    expect(state.errorKey).toBe(
      "dataEntry:positionTracking.error.permissionDenied",
    );
  });

  describe("attribute with a recorded track", () => {
    const { PositionTrackingService } = jest.requireMock(
      "service/positionTracking",
    );

    const createStoreWithTrack = () => {
      const store = createStore();
      store.dispatch({
        type: "TEST_NODE_VALUE_SET",
        uuid: "track-node",
        value: trackValue,
      });
      return store;
    };

    test("starting again appends to the recorded track", async () => {
      const store = createStoreWithTrack();
      await store.dispatch(
        PositionTrackingActions.startTracking({
          nodeUuid: "track-node",
        }) as any,
      );
      expect(PositionTrackingService.start).toHaveBeenCalledWith(
        expect.objectContaining({ baseValue: trackValue }),
      );
      expect(mockConfirm).not.toHaveBeenCalled();
      await store.dispatch(
        PositionTrackingActions.stopTracking({ confirm: false }) as any,
      );
    });

    test("restart deletes the recorded track after confirmation", async () => {
      const store = createStoreWithTrack();
      await store.dispatch(
        PositionTrackingActions.restartTracking({
          nodeUuid: "track-node",
        }) as any,
      );
      expect(mockConfirm).toHaveBeenCalledTimes(1);
      expect(getTrackedNodeValue(store)).toBeNull();
      expect(PositionTrackingService.start).toHaveBeenCalledWith(
        expect.objectContaining({ baseValue: null }),
      );
      expect(store.getState().positionTracking.status).toBe(
        PositionTrackingStatus.tracking,
      );
      await store.dispatch(
        PositionTrackingActions.stopTracking({ confirm: false }) as any,
      );
    });

    test("restart keeps the recorded track when not confirmed", async () => {
      mockConfirm.mockImplementation(async () => null);
      const store = createStoreWithTrack();
      await store.dispatch(
        PositionTrackingActions.restartTracking({
          nodeUuid: "track-node",
        }) as any,
      );
      expect(getTrackedNodeValue(store)).toEqual(trackValue);
      expect(PositionTrackingService.start).not.toHaveBeenCalled();
    });

    test("delete clears the recorded track after confirmation", async () => {
      const store = createStoreWithTrack();
      await store.dispatch(
        PositionTrackingActions.deleteTrack({ nodeUuid: "track-node" }) as any,
      );
      expect(mockConfirm).toHaveBeenCalledTimes(1);
      expect(getTrackedNodeValue(store)).toBeNull();
      expect(PositionTrackingService.start).not.toHaveBeenCalled();
    });

    test("delete keeps the recorded track when not confirmed", async () => {
      mockConfirm.mockImplementation(async () => null);
      const store = createStoreWithTrack();
      await store.dispatch(
        PositionTrackingActions.deleteTrack({ nodeUuid: "track-node" }) as any,
      );
      expect(getTrackedNodeValue(store)).toEqual(trackValue);
    });

    test("delete is not possible while tracking", async () => {
      const store = createStoreWithTrack();
      await store.dispatch(
        PositionTrackingActions.startTracking({
          nodeUuid: "track-node",
        }) as any,
      );
      await store.dispatch(
        PositionTrackingActions.deleteTrack({ nodeUuid: "track-node" }) as any,
      );
      expect(mockConfirm).not.toHaveBeenCalled();
      expect(getTrackedNodeValue(store)).toEqual(trackValue);
      await store.dispatch(
        PositionTrackingActions.stopTracking({ confirm: false }) as any,
      );
    });
  });
});
