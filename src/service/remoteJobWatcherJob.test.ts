import { JobStatus } from "@openforis/arena-core";

import { RemoteJobService, WebSocketService } from "service";

import { RemoteJobWatcherJob } from "./remoteJobWatcherJob";

jest.mock("model", () => ({
  JobMobile: class {
    context: any;
    errors: any = {};
    logger = { debug: jest.fn(), warn: jest.fn() };
    result: any;
    constructor(context: any) {
      this.context = context;
    }
    setResult(result: any) {
      this.result = result;
    }
  },
}));

jest.mock("service", () => ({
  RemoteJobService: { fetchJob: jest.fn(), cancelActiveJob: jest.fn() },
  WebSocketService: {
    EVENTS: { jobUpdate: "jobUpdate" },
    open: jest.fn(),
    close: jest.fn(),
  },
}));

const remoteJobUuid = "job-1";
const fetchJobMock = RemoteJobService.fetchJob as jest.Mock;

const startJob = async () => {
  let emitJobUpdate: (summary: any) => void = () => {};
  (WebSocketService.open as jest.Mock).mockResolvedValue({
    on: (_event: string, handler: any) => {
      emitJobUpdate = handler;
    },
  });
  const job: any = new RemoteJobWatcherJob({});
  job.context.remoteJobUuid = remoteJobUuid;
  let ended = false;
  const execution = job.execute().finally(() => {
    ended = true;
  });
  await jest.advanceTimersByTimeAsync(0);
  return {
    job,
    execution,
    isEnded: () => ended,
    emitJobUpdate: (summary: any) => emitJobUpdate(summary),
  };
};

describe("RemoteJobWatcherJob", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });
  afterEach(() => jest.useRealTimers());

  it("ignores the updates of other jobs", async () => {
    fetchJobMock.mockResolvedValue({ data: { status: JobStatus.running } });
    const { job, execution, isEnded, emitJobUpdate } = await startJob();

    emitJobUpdate({ uuid: "job-2", status: JobStatus.succeeded, result: {} });
    await jest.advanceTimersByTimeAsync(0);
    expect(isEnded()).toBe(false);

    const result = { mergedSameRecordUuids: [] };
    emitJobUpdate({ uuid: remoteJobUuid, status: JobStatus.succeeded, result });
    await execution;
    expect(job.result).toBe(result);
  });

  it("ends when the final update is only available by polling", async () => {
    const result = {};
    fetchJobMock.mockResolvedValue({
      data: { uuid: remoteJobUuid, status: JobStatus.succeeded, result },
    });
    const { job, execution } = await startJob();

    await jest.advanceTimersByTimeAsync(30_000);
    await execution;

    expect(fetchJobMock).toHaveBeenCalledWith(remoteJobUuid);
    expect(job.result).toBe(result);
  });

  it("keeps waiting when a poll fails", async () => {
    fetchJobMock.mockRejectedValue(new Error("network"));
    const { isEnded, emitJobUpdate, execution } = await startJob();

    await jest.advanceTimersByTimeAsync(30_000);
    expect(isEnded()).toBe(false);

    emitJobUpdate({ uuid: remoteJobUuid, status: JobStatus.succeeded });
    await execution;
  });

  it("fails when a polled job has no result", async () => {
    fetchJobMock.mockResolvedValue({
      data: { uuid: remoteJobUuid, status: JobStatus.succeeded, result: null },
    });
    const { execution } = await startJob();
    const expectation = expect(execution).rejects.toThrow(
      "result not available",
    );

    await jest.advanceTimersByTimeAsync(30_000);
    await expectation;
  });
});
