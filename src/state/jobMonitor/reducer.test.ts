import { JobStatus } from "@openforis/arena-core";

import { JobMonitorReducer, JobMonitorSliceActions } from "./reducer";

describe("JobMonitorReducer", () => {
  const initialState = JobMonitorReducer(undefined, { type: "@@INIT" });

  it("starts closed", () => {
    expect(initialState.isOpen).toBe(false);
    expect(initialState.status).toBe(JobStatus.pending);
  });

  it("start resets the previous job state and opens the monitor", () => {
    const prev = JobMonitorReducer(
      initialState,
      JobMonitorSliceActions.update({ progressPercent: 80, silent: true }),
    );
    const state = JobMonitorReducer(
      prev,
      JobMonitorSliceActions.start({ titleKey: "custom:title" }),
    );
    expect(state).toEqual({
      ...initialState,
      titleKey: "custom:title",
      isOpen: true,
    });
  });

  it("update merges the payload", () => {
    const started = JobMonitorReducer(
      initialState,
      JobMonitorSliceActions.start({}),
    );
    const state = JobMonitorReducer(
      started,
      JobMonitorSliceActions.update({
        progressPercent: 50,
        status: JobStatus.running,
      }),
    );
    expect(state).toEqual({
      ...started,
      progressPercent: 50,
      status: JobStatus.running,
    });
  });

  it("end resets the state", () => {
    const started = JobMonitorReducer(
      initialState,
      JobMonitorSliceActions.start({ titleKey: "custom:title" }),
    );
    expect(JobMonitorReducer(started, JobMonitorSliceActions.end())).toEqual(
      initialState,
    );
  });
});
