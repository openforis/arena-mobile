import { ActionHandlers, StoreUtils } from "../storeUtils";

import { PositionTrackingState, PositionTrackingStatus } from "./types";

export const POSITION_TRACKING_UPDATE = "POSITION_TRACKING_UPDATE";
export const POSITION_TRACKING_RESET = "POSITION_TRACKING_RESET";

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

const actionHandlers: ActionHandlers<PositionTrackingState> = {
  [POSITION_TRACKING_UPDATE]: ({ state, action }) => ({
    ...state,
    ...action.payload,
  }),
  [POSITION_TRACKING_RESET]: () => ({ ...positionTrackingInitialState }),
};

export const PositionTrackingReducer = StoreUtils.exportReducer({
  actionHandlers,
  initialState: positionTrackingInitialState,
});
