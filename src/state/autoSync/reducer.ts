import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { AutoSyncMessage, AutoSyncState, AutoSyncStatus } from "./types";

const initialState: AutoSyncState = {
  checking: false,
  lastCheckedAt: null,
  status: AutoSyncStatus.unchecked,
  message: null,
  lastLocalChangeAt: null,
  conflictingKeysWithMergeNotAllowed: false,
  dialogOpen: false,
};

const autoSyncSlice = createSlice({
  name: "autoSync",
  initialState,
  reducers: {
    checkStart: (state) => {
      state.checking = true;
      state.message = null;
    },
    checkEnd: (
      state,
      action: PayloadAction<
        Pick<
          AutoSyncState,
          "status" | "conflictingKeysWithMergeNotAllowed" | "lastCheckedAt"
        >
      >,
    ) => {
      Object.assign(state, action.payload);
      state.checking = false;
    },
    checkAborted: (state) => {
      state.checking = false;
    },
    authError: (state) => {
      state.status = AutoSyncStatus.authError;
      state.checking = false;
    },
    checkError: (state) => {
      state.status = AutoSyncStatus.checkError;
      state.checking = false;
    },
    reset: (state) => ({ ...initialState, dialogOpen: state.dialogOpen }),
    setStatusMessage: (state, action: PayloadAction<AutoSyncMessage>) => {
      state.message = action.payload;
    },
    markPending: (
      state,
      action: PayloadAction<{ lastLocalChangeAt: string }>,
    ) => {
      state.status = AutoSyncStatus.pending;
      state.lastLocalChangeAt = action.payload.lastLocalChangeAt;
    },
    setDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.dialogOpen = action.payload;
    },
  },
});

export const AutoSyncSliceActions = autoSyncSlice.actions;
export const AutoSyncReducer = autoSyncSlice.reducer;
