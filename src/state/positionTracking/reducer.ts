import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { PositionTrackingState, PositionTrackingStatus } from "./types";

export const positionTrackingInitialState: PositionTrackingState = {
  status: PositionTrackingStatus.idle,
  recordUuid: null,
  nodeUuid: null,
  length: 0,
  pointsCount: 0,
  lastAccuracy: null,
  lastFixTime: null,
  durationMs: 0,
  currentSegmentLastPointTime: null,
  errorKey: null,
};

const positionTrackingSlice = createSlice({
  name: "positionTracking",
  initialState: positionTrackingInitialState,
  reducers: {
    update: (state, action: PayloadAction<Partial<PositionTrackingState>>) => {
      Object.assign(state, action.payload);
    },
    reset: () => ({ ...positionTrackingInitialState }),
  },
});

export const PositionTrackingSliceActions = positionTrackingSlice.actions;
export const PositionTrackingReducer = positionTrackingSlice.reducer;
