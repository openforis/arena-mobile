import { ArenaRecord } from "@openforis/arena-core";

import { SurveySliceActions } from "../survey/reducer";
import { DataEntryReducer, DataEntrySliceActions } from "./reducer";

jest.mock("localization", () => ({ i18n: { language: "en" } }));

const record = { uuid: "record-uuid" } as unknown as ArenaRecord;
const otherRecord = { uuid: "other-record-uuid" } as unknown as ArenaRecord;

describe("DataEntryReducer", () => {
  const initialState = DataEntryReducer(undefined, { type: "@@INIT" });

  it("recordSet keeps the flags not specified", () => {
    const opened = DataEntryReducer(
      initialState,
      DataEntrySliceActions.recordSet({
        record,
        recordEditLockAvailable: true,
        recordEditLocked: true,
        recordPageSelectorMenuOpen: true,
      }),
    );
    const state = DataEntryReducer(
      opened,
      DataEntrySliceActions.recordSet({ record: otherRecord }),
    );
    expect(state).toEqual({
      ...initialState,
      record: otherRecord,
      recordEditLockAvailable: true,
      recordEditLocked: true,
      recordPageSelectorMenuOpen: true,
    });
  });

  it("pageEntitySet resets the active child index", () => {
    let state = DataEntryReducer(
      initialState,
      DataEntrySliceActions.pageEntityActiveChildIndexSet(2),
    );
    expect(state.activeChildDefIndex).toBe(2);
    const pointer = { parentEntityUuid: "p", entityDefUuid: "e" };
    state = DataEntryReducer(
      state,
      DataEntrySliceActions.pageEntitySet(pointer),
    );
    expect(state.recordCurrentPageEntity).toEqual(pointer);
    expect(state.activeChildDefIndex).toBe(0);
  });

  it("links and unlinks the previous cycle record", () => {
    let state = DataEntryReducer(
      initialState,
      DataEntrySliceActions.previousCyclePageEntitySet({
        previousCycleEntityUuid: "e",
      }),
    );
    state = DataEntryReducer(
      state,
      DataEntrySliceActions.previousCycleRecordSet(otherRecord),
    );
    expect(state).toMatchObject({
      linkToPreviousCycleRecord: true,
      previousCycleRecord: otherRecord,
      previousCycleRecordPageEntity: {},
    });
    state = DataEntryReducer(
      state,
      DataEntrySliceActions.previousCycleRecordReset(),
    );
    expect(state).toMatchObject({
      linkToPreviousCycleRecord: false,
      previousCycleRecord: undefined,
      previousCycleRecordPageEntity: {},
    });
  });

  it("sets the simple flags", () => {
    let state = DataEntryReducer(
      initialState,
      DataEntrySliceActions.recordEditLockedSet(true),
    );
    state = DataEntryReducer(
      state,
      DataEntrySliceActions.recordSyncInProgressSet(true),
    );
    state = DataEntryReducer(
      state,
      DataEntrySliceActions.previousCycleRecordLoadingSet(true),
    );
    state = DataEntryReducer(
      state,
      DataEntrySliceActions.pageSelectorMenuOpenSet(true),
    );
    expect(state).toMatchObject({
      recordEditLocked: true,
      recordSyncInProgress: true,
      previousCycleRecordLoading: true,
      recordPageSelectorMenuOpen: true,
    });
  });

  it("resets on reset and when the current survey changes", () => {
    const opened = DataEntryReducer(
      initialState,
      DataEntrySliceActions.recordSet({ record, recordEditLocked: true }),
    );
    expect(DataEntryReducer(opened, DataEntrySliceActions.reset())).toEqual(
      initialState,
    );
    expect(
      DataEntryReducer(
        opened,
        SurveySliceActions.currentSurveySet({ survey: null }),
      ),
    ).toEqual(initialState);
  });
});
