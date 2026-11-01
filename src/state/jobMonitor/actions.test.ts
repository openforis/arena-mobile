import { JobStatus } from "@openforis/arena-core";

import { JobMonitorActions } from "./actions";

jest.mock("model", () => ({ JobCancelError: class extends Error {} }));

jest.mock("service", () => ({ RemoteJobService: {}, WebSocketService: {} }));

jest.mock("utils", () => ({ log: { debug: jest.fn() } }));

const createFakeJob = () => {
  let listener: () => void;
  const job = {
    summary: {} as any,
    isEnded: () => false,
    onEvent: (callback: () => void) => {
      listener = callback;
    },
    toJSON: () => job.summary,
    update: (summary: any) => {
      job.summary = { status: JobStatus.running, ...summary };
      listener();
    },
  };
  return job;
};

const startJob = async (job: ReturnType<typeof createFakeJob>) => {
  const dispatch = jest.fn();
  const getState = () => ({ jobMonitor: {} });
  await JobMonitorActions.start({ job: job as any, showTransferStats: true })(
    dispatch,
    getState,
  );
  return dispatch;
};

const lastUpdatePayload = (dispatch: jest.Mock) =>
  dispatch.mock.calls
    .map(([action]) => action)
    .findLast(({ type }) => type === JobMonitorActions.JOB_MONITOR_UPDATE)
    .payload;

describe("JobMonitorActions transfer stats", () => {
  beforeEach(() => {
    jest.spyOn(Date, "now").mockReturnValue(0);
  });

  afterEach(() => jest.restoreAllMocks());

  const updateTwoSecondsApart = (
    job: ReturnType<typeof createFakeJob>,
    first: any,
    second: any,
  ) => {
    job.update(first);
    jest.spyOn(Date, "now").mockReturnValue(2000);
    job.update(second);
  };

  it("uses processed and total when the job does not provide the bytes", async () => {
    const job = createFakeJob();
    const dispatch = await startJob(job);

    updateTwoSecondsApart(
      job,
      { processed: 0, total: 8000 },
      { processed: 4000, total: 8000 },
    );

    expect(lastUpdatePayload(dispatch)).toMatchObject({
      transferSpeedBytesPerSec: 2000,
      etaSeconds: 2,
    });
  });

  it("uses the bytes provided by the job in place of processed and total", async () => {
    const job = createFakeJob();
    const dispatch = await startJob(job);

    updateTwoSecondsApart(
      job,
      {
        processed: 0,
        total: 10,
        transferProcessedBytes: 0,
        transferTotalBytes: 8000,
      },
      {
        processed: 5,
        total: 10,
        transferProcessedBytes: 4000,
        transferTotalBytes: 8000,
      },
    );

    expect(lastUpdatePayload(dispatch)).toMatchObject({
      transferSpeedBytesPerSec: 2000,
      etaSeconds: 2,
    });
  });
});
