import { useCallback } from "react";

import { OfflineMapsService } from "service";
import { useConfirm } from "state";
import { Files } from "utils";

import { checkStorageEstimate } from "./storageEstimateUtils";

type LowSpaceConfirmParams = {
  titleKey: string;
  messageKey: string;
  confirmButtonTextKey: string;
};

export const useStorageEstimateCheck = ({
  estimatedSizeBytes,
  freeDiskStorage,
}: {
  estimatedSizeBytes: number | null | undefined;
  freeDiskStorage: number | null;
}) => {
  const confirm = useConfirm();

  const { exceedsFreeSpace, freeSpaceUsageRatio, freeSpaceLow } =
    checkStorageEstimate({
      estimatedSizeBytes,
      freeDiskStorage,
      warningRatio: OfflineMapsService.FREE_SPACE_WARNING_RATIO,
    });

  const freeSpaceText =
    freeDiskStorage === null
      ? "-"
      : Files.toHumanReadableFileSize(freeDiskStorage);

  // resolves to true if the free space is not low or the user confirms to go on
  const confirmLowSpace = useCallback(
    async (params: LowSpaceConfirmParams): Promise<boolean> =>
      !freeSpaceLow ||
      !!(await confirm({
        ...params,
        messageParams: {
          size: Files.toHumanReadableFileSize(estimatedSizeBytes ?? 0),
          freeSpace: Files.toHumanReadableFileSize(freeDiskStorage ?? 0),
          percent: Math.floor((freeSpaceUsageRatio ?? 0) * 100),
        },
      })),
    [
      confirm,
      estimatedSizeBytes,
      freeDiskStorage,
      freeSpaceLow,
      freeSpaceUsageRatio,
    ],
  );

  return { confirmLowSpace, exceedsFreeSpace, freeSpaceText };
};
