import { ArenaRecord } from "@openforis/arena-core";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RecordCurrentPageEntityPointer } from "model/RecordCurrentPageEntity";

import { SurveySliceActions } from "../survey/reducer";
import { DataEntryState, PreviousCycleRecordPageEntityPointer } from "./types";

const initialState: DataEntryState = {
  record: undefined,
  recordEditLockAvailable: false,
  recordEditLocked: false,
  recordSyncInProgress: false,
  recordCurrentPageEntity: undefined,
  recordPageSelectorMenuOpen: false,
  linkToPreviousCycleRecord: false,
  previousCycleRecordLoading: false,
  previousCycleRecord: undefined,
  previousCycleRecordPageEntity: {},
};

const dataEntrySlice = createSlice({
  name: "dataEntry",
  initialState,
  reducers: {
    reset: () => initialState,
    // the optional flags are kept unchanged when not specified
    recordSet: (
      state,
      action: PayloadAction<{
        record: ArenaRecord;
        recordEditLockAvailable?: boolean;
        recordEditLocked?: boolean;
        recordPageSelectorMenuOpen?: boolean;
      }>,
    ) => {
      const {
        record,
        recordEditLockAvailable,
        recordEditLocked,
        recordPageSelectorMenuOpen,
      } = action.payload;
      state.record = record;
      state.recordEditLockAvailable =
        recordEditLockAvailable ?? state.recordEditLockAvailable;
      state.recordEditLocked = recordEditLocked ?? state.recordEditLocked;
      state.recordPageSelectorMenuOpen =
        recordPageSelectorMenuOpen ?? state.recordPageSelectorMenuOpen;
    },
    recordEditLockedSet: (state, action: PayloadAction<boolean>) => {
      state.recordEditLocked = action.payload;
    },
    recordSyncInProgressSet: (state, action: PayloadAction<boolean>) => {
      state.recordSyncInProgress = action.payload;
    },
    previousCycleRecordLoadingSet: (state, action: PayloadAction<boolean>) => {
      state.previousCycleRecordLoading = action.payload;
    },
    previousCycleRecordSet: (state, action: PayloadAction<ArenaRecord>) => {
      state.linkToPreviousCycleRecord = true;
      state.previousCycleRecord = action.payload;
      state.previousCycleRecordPageEntity = {};
    },
    previousCycleRecordReset: (state) => {
      state.linkToPreviousCycleRecord = false;
      state.previousCycleRecord = undefined;
      state.previousCycleRecordPageEntity = {};
    },
    pageEntitySet: (
      state,
      action: PayloadAction<
        (RecordCurrentPageEntityPointer & { locked?: boolean }) | undefined
      >,
    ) => {
      state.recordCurrentPageEntity = action.payload;
      state.activeChildDefIndex = 0;
    },
    pageEntityActiveChildIndexSet: (state, action: PayloadAction<number>) => {
      state.activeChildDefIndex = action.payload;
    },
    pageSelectorMenuOpenSet: (state, action: PayloadAction<boolean>) => {
      state.recordPageSelectorMenuOpen = action.payload;
    },
    previousCyclePageEntitySet: (
      state,
      action: PayloadAction<PreviousCycleRecordPageEntityPointer>,
    ) => {
      state.previousCycleRecordPageEntity = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(SurveySliceActions.currentSurveySet, () => initialState);
  },
});

export const DataEntrySliceActions = dataEntrySlice.actions;
export const DataEntryReducer = dataEntrySlice.reducer;
