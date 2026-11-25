export type StorageEstimateCheck = {
  exceedsFreeSpace: boolean;
  // estimated size / free space; null when unknown
  freeSpaceUsageRatio: number | null;
  // the estimated size fits but uses a large part of the free space
  freeSpaceLow: boolean;
};

export const checkStorageEstimate = ({
  estimatedSizeBytes,
  freeDiskStorage,
  warningRatio,
}: {
  estimatedSizeBytes: number | null | undefined;
  freeDiskStorage: number | null;
  warningRatio: number;
}): StorageEstimateCheck => {
  const sizeKnown =
    estimatedSizeBytes !== null && estimatedSizeBytes !== undefined;
  const exceedsFreeSpace =
    sizeKnown &&
    freeDiskStorage !== null &&
    estimatedSizeBytes > freeDiskStorage;
  const freeSpaceUsageRatio =
    sizeKnown && freeDiskStorage !== null && freeDiskStorage > 0
      ? estimatedSizeBytes / freeDiskStorage
      : null;
  const freeSpaceLow =
    !exceedsFreeSpace &&
    freeSpaceUsageRatio !== null &&
    freeSpaceUsageRatio >= warningRatio;
  return { exceedsFreeSpace, freeSpaceUsageRatio, freeSpaceLow };
};
