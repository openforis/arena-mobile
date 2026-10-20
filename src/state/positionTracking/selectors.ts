import { useSelector } from "react-redux";

import { PositionTrackingState, PositionTrackingStatus } from "./types";

const selectPositionTrackingState = (state: any): PositionTrackingState =>
  state.positionTracking;

const selectIsTrackActive = (state: any): boolean => {
  const { status } = selectPositionTrackingState(state);
  return (
    status === PositionTrackingStatus.tracking ||
    status === PositionTrackingStatus.paused ||
    status === PositionTrackingStatus.starting
  );
};

export const PositionTrackingSelectors = {
  selectPositionTrackingState,
  selectIsTrackActive,
  usePositionTrackingState: () => useSelector(selectPositionTrackingState),
  useIsTrackActive: () => useSelector(selectIsTrackActive),
};
