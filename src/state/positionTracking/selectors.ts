import { PositionTrackingState, PositionTrackingStatus } from "./types";
import type { RootState } from "../store";
import { useAppSelector } from "../storeHooks";

const selectPositionTrackingState = (state: RootState): PositionTrackingState =>
  state.positionTracking;

const selectIsTrackActive = (state: RootState): boolean => {
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
  usePositionTrackingState: () => useAppSelector(selectPositionTrackingState),
};
