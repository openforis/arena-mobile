import { JobSerialized, JobStatus } from "@openforis/arena-core";

// a local or remote job, as notified while it runs
export type JobSummary<R = unknown> = JobSerialized<R>;

export type TransferSample = {
  processed: number;
  timestamp: number;
  speed: number;
};

export type UploadStats = {
  previousSample: TransferSample | null;
  transferTotalBytes: number | null;
  transferSpeedBytesPerSec: number | null;
  etaSeconds: number | null;
};

const endedStatuses = new Set<JobStatus | undefined>([
  JobStatus.canceled,
  JobStatus.failed,
  JobStatus.succeeded,
]);

export const isJobStatusEnded = (status: JobStatus | undefined): boolean =>
  endedStatuses.has(status);

export const calculateJobProgressPercent = ({
  jobSummary,
}: {
  jobSummary: Pick<JobSummary, "total" | "processed" | "progressPercent">;
}): number => {
  const { total, processed, progressPercent } = jobSummary;
  if (progressPercent != null) {
    return progressPercent;
  }

  const totalNumber = Number(total);
  const processedNumber = Number(processed);
  if (
    !Number.isFinite(totalNumber) ||
    totalNumber <= 0 ||
    !Number.isFinite(processedNumber)
  ) {
    return -1;
  }
  return Math.floor((processedNumber / totalNumber) * 100);
};

export const buildUploadStats = ({
  showTransferStats,
  status,
  processed,
  total,
  previousSample,
  now = Date.now(),
}: {
  showTransferStats: boolean;
  status: JobStatus;
  processed: number;
  total: number;
  previousSample: TransferSample | null;
  now?: number;
}): UploadStats => {
  if (!showTransferStats || status !== JobStatus.running) {
    return {
      previousSample,
      transferTotalBytes: null,
      transferSpeedBytesPerSec: null,
      etaSeconds: null,
    };
  }

  const processedNumber = Number(processed);
  const totalNumber = Number(total);

  if (!Number.isFinite(processedNumber) || !Number.isFinite(totalNumber)) {
    return {
      previousSample,
      transferTotalBytes: null,
      transferSpeedBytesPerSec: null,
      etaSeconds: null,
    };
  }

  if (!previousSample) {
    return {
      previousSample: {
        processed: processedNumber,
        timestamp: now,
        speed: 0,
      },
      transferTotalBytes: totalNumber,
      transferSpeedBytesPerSec: null,
      etaSeconds: null,
    };
  }

  const elapsedSeconds = Math.max(
    (now - previousSample.timestamp) / 1000,
    0.001,
  );
  const processedDiff = Math.max(0, processedNumber - previousSample.processed);
  const instantSpeed = processedDiff / elapsedSeconds;

  let speed = previousSample.speed;
  if (processedDiff > 0) {
    if (previousSample.speed > 0) {
      speed = previousSample.speed * 0.7 + instantSpeed * 0.3;
    } else {
      speed = instantSpeed;
    }
  }

  const remainingBytes = Math.max(0, totalNumber - processedNumber);
  const etaSeconds = speed > 0 ? Math.ceil(remainingBytes / speed) : null;

  return {
    previousSample: {
      processed: processedNumber,
      timestamp: now,
      speed,
    },
    transferTotalBytes: totalNumber,
    transferSpeedBytesPerSec: speed > 0 ? speed : null,
    etaSeconds,
  };
};

export type InnerJobUiConfig = {
  titleKey: string;
  showTransferStats?: boolean;
};

// picks per-phase title/transfer-stats config for a job composed of several inner jobs (e.g.
// RecordsUploadAndProcessJob's upload -> server-side processing), keyed by the current inner
// job's own "type" (its class name - see JobBase's `type` field). Without this, a composite
// job's dialog would be stuck on whatever titleKey/showTransferStats were passed once at
// JobMonitorActions.start, even as it moves through phases that need different ones (e.g.
// transfer stats only make sense while the upload phase, not the server-side one, is current)
export const resolveInnerJobUi = ({
  jobSummary,
  innerJobUiConfigByType,
}: {
  jobSummary: Partial<Pick<JobSummary, "innerJobs" | "currentInnerJobIndex">>;
  innerJobUiConfigByType?: Record<string, InnerJobUiConfig>;
}): {
  config: InnerJobUiConfig;
  currentInnerJobSummary: JobSummary;
} | null => {
  if (!innerJobUiConfigByType) return null;
  const { innerJobs, currentInnerJobIndex } = jobSummary;
  if (currentInnerJobIndex == null) return null;
  const currentInnerJobSummary = innerJobs?.[currentInnerJobIndex];
  const config =
    currentInnerJobSummary &&
    innerJobUiConfigByType[currentInnerJobSummary.type];
  return config ? { config, currentInnerJobSummary } : null;
};
