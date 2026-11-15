import {
  positionTrackingInitialState,
  PositionTrackingReducer,
  PositionTrackingSliceActions,
} from "./reducer";
import { PositionTrackingStatus } from "./types";

const { reset, update } = PositionTrackingSliceActions;

describe("PositionTrackingReducer", () => {
  it("starts idle", () => {
    expect(PositionTrackingReducer(undefined, { type: "@@INIT" })).toEqual(
      positionTrackingInitialState,
    );
  });

  it("update merges into the previous state", () => {
    const state = PositionTrackingReducer(
      undefined,
      update({ status: PositionTrackingStatus.tracking, pointsCount: 3 }),
    );
    expect(state).toEqual({
      ...positionTrackingInitialState,
      status: PositionTrackingStatus.tracking,
      pointsCount: 3,
    });
  });

  it("reset restores the initial state", () => {
    const state = PositionTrackingReducer(
      { ...positionTrackingInitialState, length: 100, recordUuid: "r1" },
      reset(),
    );
    expect(state).toEqual(positionTrackingInitialState);
  });
});
