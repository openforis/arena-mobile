import { JobStatus } from "@openforis/arena-core";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { JobMonitorState } from "./types";

const initialState: JobMonitorState = {
  isOpen: false,
  titleKey: "common:processing",
  cancelButtonTextKey: "common:cancel",
  closeButtonTextKey: "common:close",
  progressPercent: 0,
  progressRangeStart: 0,
  progressRangeEnd: 100,
  silent: false,
  status: JobStatus.pending,
  showTransferStats: false,
  transferTotalBytes: null,
  transferSpeedBytesPerSec: null,
  transferSizeTextKey: null,
  transferSpeedTextKey: null,
  transferEtaTextKey: null,
  etaSeconds: null,
};

const jobMonitorSlice = createSlice({
  name: "jobMonitor",
  initialState,
  reducers: {
    start: (_state, action: PayloadAction<Partial<JobMonitorState>>) => ({
      ...initialState,
      ...action.payload,
      isOpen: true,
    }),
    update: (state, action: PayloadAction<Partial<JobMonitorState>>) => {
      Object.assign(state, action.payload);
    },
    end: () => initialState,
  },
});

export const JobMonitorSliceActions = jobMonitorSlice.actions;
export const JobMonitorReducer = jobMonitorSlice.reducer;
