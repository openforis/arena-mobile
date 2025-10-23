import { JobStatus } from "@openforis/arena-core";

import { StoreUtils } from "../storeUtils";
import { JobMonitorActions } from "./actions";

const initialState = {
  isOpen: false,
  titleKey: "common:processing",
  cancelButtonTextKey: "common:cancel",
  closeButtonTextKey: "common:close",
  progressPercent: 0,
  status: JobStatus.pending
};

const actionHandlers = {
  [JobMonitorActions.JOB_MONITOR_START]: ({
    state,
    action
  }: any) => ({
    ...initialState,
    ...action.payload,
    isOpen: true,
  }),
  [JobMonitorActions.JOB_MONITOR_UPDATE]: ({
    state,
    action
  }: any) => ({
    ...state,
    ...action.payload
  }),
  [JobMonitorActions.JOB_MONITOR_END]: () => ({
    ...initialState,
  }),
};

export const JobMonitorReducer = StoreUtils.exportReducer({
  actionHandlers,
  initialState,
});
