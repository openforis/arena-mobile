import { SurveyActionTypes } from "state/survey";

import { StoreUtils } from "../storeUtils";

import { DataEntryActionTypes } from "./actionTypes";
import { DataEntryState } from "./types";

const initialState: DataEntryState = {
  record: null,
  recordEditLockAvailable: false,
  recordEditLocked: false,
  recordCurrentPageEntity: null,
  recordPageSelectorMenuOpen: false,
  linkToPreviousCycleRecord: false,
  previousCycleRecordLoading: false,
  previousCycleRecord: null,
  previousCycleRecordPageEntity: {},
};

const actionHandlers = {
  [SurveyActionTypes.CURRENT_SURVEY_SET]: () => ({ ...initialState }),
  [DataEntryActionTypes.DATA_ENTRY_RESET]: () => ({ ...initialState }),

  [DataEntryActionTypes.RECORD_SET]: ({
    state,
    action,
  }: {
    state: DataEntryState;
    action: any;
  }) => ({
    ...state,
    record: action.record,
    recordEditLockAvailable:
      action.recordEditLockAvailable ?? state.recordEditLockAvailable,
    recordEditLocked: action.recordEditLocked ?? state.recordEditLocked,
    recordPageSelectorMenuOpen:
      action.recordPageSelectorMenuOpen ?? state.recordPageSelectorMenuOpen,
  }),
  [DataEntryActionTypes.RECORD_EDIT_LOCKED]: ({
    state,
    action,
  }: {
    state: DataEntryState;
    action: any;
  }) => ({
    ...state,
    recordEditLocked: action.locked,
  }),
  [DataEntryActionTypes.RECORD_PREVIOUS_CYCLE_LOAD]: ({
    state,
    action,
  }: {
    state: DataEntryState;
    action: any;
  }) => ({
    ...state,
    previousCycleRecordLoading: action.loading,
  }),
  [DataEntryActionTypes.RECORD_PREVIOUS_CYCLE_SET]: ({
    state,
    action,
  }: {
    state: DataEntryState;
    action: any;
  }) => ({
    ...state,
    linkToPreviousCycleRecord: true,
    previousCycleRecord: action.record,
    previousCycleRecordPageEntity: {},
  }),
  [DataEntryActionTypes.RECORD_PREVIOUS_CYCLE_RESET]: ({
    state,
  }: {
    state: DataEntryState;
  }) => ({
    ...state,
    linkToPreviousCycleRecord: false,
    previousCycleRecord: null,
    previousCycleRecordPageEntity: {},
  }),
  [DataEntryActionTypes.PAGE_ENTITY_SET]: ({
    state,
    action,
  }: {
    state: DataEntryState;
    action: any;
  }) => ({
    ...state,
    recordCurrentPageEntity: action.payload,
    activeChildDefIndex: 0,
  }),
  [DataEntryActionTypes.PAGE_ENTITY_ACTIVE_CHILD_INDEX_SET]: ({
    state,
    action,
  }: {
    state: DataEntryState;
    action: any;
  }) => ({ ...state, activeChildDefIndex: action.index }),
  [DataEntryActionTypes.PAGE_SELECTOR_MENU_OPEN_SET]: ({
    state,
    action,
  }: {
    state: DataEntryState;
    action: any;
  }) => ({
    ...state,
    recordPageSelectorMenuOpen: action.open,
  }),
  [DataEntryActionTypes.PREVIOUS_CYCLE_PAGE_ENTITY_SET]: ({
    state,
    action,
  }: {
    state: DataEntryState;
    action: any;
  }) => ({
    ...state,
    previousCycleRecordPageEntity: action.payload,
  }),
};

export const DataEntryReducer = StoreUtils.exportReducer({
  actionHandlers,
  initialState,
});
