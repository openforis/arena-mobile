import { useCallback, useEffect, useState } from "react";

import { GpsSourceDescriptor } from "service/externalGps/types";
import { ExternalGpsService } from "service/externalGps/ExternalGpsService";
import { useIsMountedRef } from "./useIsMountedRef";
import { useNavigationFocus } from "./useNavigationFocus";

/**
 * Lists GPS sources the user can pick from (internal GPS + any recognized bonded
 * external device), shared by the Settings screen's source field and the
 * quick-access menu in LocationWatchingMonitor so discovery logic isn't duplicated.
 * Refreshes on mount and whenever the owning screen regains focus, since bonded
 * devices can change while the app is in the background (e.g. re-pairing).
 */
export const useAvailableGpsSources = () => {
  const isMountedRef = useIsMountedRef();
  const [availableGpsSources, setAvailableGpsSources] = useState<
    GpsSourceDescriptor[]
  >([]);

  const refreshAvailableGpsSources = useCallback(async () => {
    const sources = await ExternalGpsService.listAvailableSources();
    if (isMountedRef.current) {
      setAvailableGpsSources(sources);
    }
  }, [isMountedRef]);

  useEffect(() => {
    refreshAvailableGpsSources();
  }, [refreshAvailableGpsSources]);

  useNavigationFocus(refreshAvailableGpsSources);

  return { availableGpsSources, refreshAvailableGpsSources };
};
