// keeps each upload zip small: it needs about twice its files size of free space and zips over 4 GB are fragile
export const MAX_UPLOAD_BATCH_FILES_SIZE = 1024 * 1024 * 1024;

/**
 * Splits the record uuids (keeping their order) into batches whose files size doesn't exceed maxBatchFilesSize;
 * a record with bigger files gets a batch of its own.
 */
export const splitRecordUuidsInBatches = ({
  recordUuids,
  filesSizeByRecordUuid,
  maxBatchFilesSize = MAX_UPLOAD_BATCH_FILES_SIZE,
}: {
  recordUuids: string[];
  filesSizeByRecordUuid: Record<string, number>;
  maxBatchFilesSize?: number;
}): string[][] => {
  const batches: string[][] = [];
  let currentBatch: string[] = [];
  let currentBatchSize = 0;
  for (const recordUuid of recordUuids) {
    const size = filesSizeByRecordUuid[recordUuid] ?? 0;
    if (
      currentBatch.length > 0 &&
      currentBatchSize + size > maxBatchFilesSize
    ) {
      batches.push(currentBatch);
      currentBatch = [];
      currentBatchSize = 0;
    }
    currentBatch.push(recordUuid);
    currentBatchSize += size;
  }
  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }
  return batches;
};
