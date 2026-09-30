import { useCallback } from "react";

import { useToast } from "hooks";
import { JobCancelError, OfflineMapArea } from "model";
import { OfflineMapsService } from "service";
import { JobMonitorActions, useAppDispatch } from "state";
import { Files, log } from "utils";

// starts the download of the tiles of an area (tiles already on the device are skipped),
// showing the job monitor dialog; resolves with the updated area or null if canceled/failed
export const useOfflineMapAreaDownload = () => {
  const dispatch = useAppDispatch();
  const toaster = useToast();

  return useCallback(
    async (area: OfflineMapArea): Promise<OfflineMapArea | null> => {
      const job = OfflineMapsService.createDownloadJob(area);
      try {
        const jobComplete = await JobMonitorActions.startAsync({
          dispatch,
          job,
          titleKey: "offlineMaps:download.title",
          autoDismiss: true,
        });
        const areaUpdated: OfflineMapArea | undefined = (jobComplete as any)
          ?.result?.area;
        if (areaUpdated) {
          const { downloadedTilesCount, tilesCount, sizeBytes } = areaUpdated;
          toaster(
            downloadedTilesCount < tilesCount
              ? "offlineMaps:download.completeWithMissingTiles"
              : "offlineMaps:download.complete",
            {
              missingTiles: tilesCount - downloadedTilesCount,
              size: Files.toHumanReadableFileSize(sizeBytes),
            },
          );
        }
        return areaUpdated ?? null;
      } catch (error) {
        if (!(error instanceof JobCancelError)) {
          log.error("offline map area download failed", error);
          toaster("offlineMaps:download.error", { details: String(error) });
        }
        return null;
      }
    },
    [dispatch, toaster],
  );
};
