import { JobStatus } from "@openforis/arena-core";

import {
  buildUploadStats,
  calculateJobProgressPercent,
  isJobStatusEnded,
  JobSummary,
  resolveInnerJobUi,
} from "./jobProgress";

describe("isJobStatusEnded", () => {
  test("true only for canceled, failed and succeeded", () => {
    expect(isJobStatusEnded(JobStatus.succeeded)).toBe(true);
    expect(isJobStatusEnded(JobStatus.failed)).toBe(true);
    expect(isJobStatusEnded(JobStatus.canceled)).toBe(true);
    expect(isJobStatusEnded(JobStatus.running)).toBe(false);
    expect(isJobStatusEnded(JobStatus.pending)).toBe(false);
    expect(isJobStatusEnded(undefined)).toBe(false);
  });
});

describe("calculateJobProgressPercent", () => {
  const progress = (summary: {
    total: number;
    processed: number;
    progressPercent?: number;
  }) =>
    calculateJobProgressPercent({
      jobSummary: summary as Pick<
        JobSummary,
        "total" | "processed" | "progressPercent"
      >,
    });

  test("uses the progress percent of the job when available", () => {
    expect(progress({ total: 10, processed: 1, progressPercent: 42 })).toBe(42);
  });

  test("computes it from processed and total otherwise", () => {
    expect(progress({ total: 3, processed: 2 })).toBe(66);
  });

  test("-1 when the total is unknown", () => {
    expect(progress({ total: 0, processed: 2 })).toBe(-1);
    expect(progress({ total: Number.NaN, processed: 2 })).toBe(-1);
  });
});

describe("buildUploadStats", () => {
  const base = {
    showTransferStats: true,
    status: JobStatus.running,
    total: 1000,
  };

  test("no stats when not requested or the job is not running", () => {
    const expected = {
      previousSample: null,
      transferTotalBytes: null,
      transferSpeedBytesPerSec: null,
      etaSeconds: null,
    };
    expect(
      buildUploadStats({
        ...base,
        showTransferStats: false,
        processed: 10,
        previousSample: null,
      }),
    ).toEqual(expected);
    expect(
      buildUploadStats({
        ...base,
        status: JobStatus.succeeded,
        processed: 10,
        previousSample: null,
      }),
    ).toEqual(expected);
  });

  test("the first sample only records the starting point", () => {
    expect(
      buildUploadStats({
        ...base,
        processed: 100,
        previousSample: null,
        now: 5000,
      }),
    ).toEqual({
      previousSample: { processed: 100, timestamp: 5000, speed: 0 },
      transferTotalBytes: 1000,
      transferSpeedBytesPerSec: null,
      etaSeconds: null,
    });
  });

  test("speed and remaining time from the previous sample", () => {
    const stats = buildUploadStats({
      ...base,
      processed: 300,
      previousSample: { processed: 100, timestamp: 0, speed: 0 },
      now: 1000,
    });
    expect(stats.transferSpeedBytesPerSec).toBe(200);
    expect(stats.etaSeconds).toBe(4);
    expect(stats.previousSample).toEqual({
      processed: 300,
      timestamp: 1000,
      speed: 200,
    });
  });

  test("smooths the speed with the previous one", () => {
    const stats = buildUploadStats({
      ...base,
      processed: 300,
      previousSample: { processed: 100, timestamp: 0, speed: 100 },
      now: 1000,
    });
    // 100 * 0.7 + 200 * 0.3
    expect(stats.transferSpeedBytesPerSec).toBeCloseTo(130);
  });

  test("keeps the previous speed when nothing was transferred", () => {
    const stats = buildUploadStats({
      ...base,
      processed: 100,
      previousSample: { processed: 100, timestamp: 0, speed: 50 },
      now: 1000,
    });
    expect(stats.transferSpeedBytesPerSec).toBe(50);
    expect(stats.etaSeconds).toBe(18);
  });
});

describe("resolveInnerJobUi", () => {
  const innerJobs = [
    { type: "UploadJob", processed: 5, total: 10 },
    { type: "ProcessJob", processed: 0, total: 1 },
  ] as JobSummary[];
  const innerJobUiConfigByType = {
    UploadJob: { titleKey: "upload", showTransferStats: true },
  };

  test("config of the current inner job", () => {
    expect(
      resolveInnerJobUi({
        jobSummary: { innerJobs, currentInnerJobIndex: 0 },
        innerJobUiConfigByType,
      }),
    ).toEqual({
      config: innerJobUiConfigByType.UploadJob,
      currentInnerJobSummary: innerJobs[0],
    });
  });

  test("null without config for the current inner job or without configs", () => {
    expect(
      resolveInnerJobUi({
        jobSummary: { innerJobs, currentInnerJobIndex: 1 },
        innerJobUiConfigByType,
      }),
    ).toBeNull();
    expect(
      resolveInnerJobUi({
        jobSummary: { innerJobs, currentInnerJobIndex: 0 },
      }),
    ).toBeNull();
  });
});
