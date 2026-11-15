import { AutoSyncReducer, AutoSyncSliceActions } from "./reducer";
import { AutoSyncStatus } from "./types";

describe("AutoSyncReducer", () => {
  const initialState = AutoSyncReducer(undefined, { type: "@@INIT" });

  it("checkStart sets checking and clears the message", () => {
    const prev = AutoSyncReducer(
      initialState,
      AutoSyncSliceActions.setStatusMessage({ textKey: "some:key" }),
    );
    const state = AutoSyncReducer(prev, AutoSyncSliceActions.checkStart());
    expect(state.checking).toBe(true);
    expect(state.message).toBeNull();
  });

  it("checkEnd stores the check result", () => {
    const checking = AutoSyncReducer(
      initialState,
      AutoSyncSliceActions.checkStart(),
    );
    const state = AutoSyncReducer(
      checking,
      AutoSyncSliceActions.checkEnd({
        status: AutoSyncStatus.synced,
        conflictingKeysWithMergeNotAllowed: true,
        lastCheckedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    expect(state).toEqual({
      ...initialState,
      status: AutoSyncStatus.synced,
      conflictingKeysWithMergeNotAllowed: true,
      lastCheckedAt: "2026-01-01T00:00:00.000Z",
    });
  });

  it("authError and checkError set the status and stop checking", () => {
    const checking = AutoSyncReducer(
      initialState,
      AutoSyncSliceActions.checkStart(),
    );
    expect(
      AutoSyncReducer(checking, AutoSyncSliceActions.authError()),
    ).toMatchObject({ checking: false, status: AutoSyncStatus.authError });
    expect(
      AutoSyncReducer(checking, AutoSyncSliceActions.checkError()),
    ).toMatchObject({ checking: false, status: AutoSyncStatus.checkError });
  });

  it("markPending sets the pending status and the last local change", () => {
    const state = AutoSyncReducer(
      initialState,
      AutoSyncSliceActions.markPending({
        lastLocalChangeAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    expect(state.status).toBe(AutoSyncStatus.pending);
    expect(state.lastLocalChangeAt).toBe("2026-01-01T00:00:00.000Z");
  });

  it("reset keeps only dialogOpen", () => {
    let state = AutoSyncReducer(
      initialState,
      AutoSyncSliceActions.setDialogOpen(true),
    );
    state = AutoSyncReducer(state, AutoSyncSliceActions.authError());
    expect(AutoSyncReducer(state, AutoSyncSliceActions.reset())).toEqual({
      ...initialState,
      dialogOpen: true,
    });
  });
});
