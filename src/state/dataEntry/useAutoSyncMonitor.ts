import { useEffect } from "react";

import { useIsNetworkConnected } from "hooks";
import { SurveyService } from "service";
import { RemoteConnectionSelectors } from "state/remoteConnection";
import { SettingsSelectors } from "state/settings";
import { SurveySelectors } from "state/survey";
import { useAppDispatch } from "state/store";

import { DataEntryActions } from "./actions";

const AUTO_SYNC_INTERVAL_MS = 90_000; // 90 sec

/**
 * Periodically attempts to upload records that are safe to sync automatically,
 * as long as the "auto sync" setting is enabled. (Depending on platform/runtime,
 * JS timers may pause while the app is backgrounded.) See DataEntryActions.runAutoSync.
 */
export const useAutoSyncMonitor = () => {
  const dispatch = useAppDispatch();
  const networkAvailable = useIsNetworkConnected();
  const survey = SurveySelectors.useCurrentSurvey();
  const user = RemoteConnectionSelectors.useLoggedInUser();
  const { autoSyncEnabled } = SettingsSelectors.useSettings();

  const isDemoSurvey = survey?.uuid === SurveyService.demoSurveyUuid;

  const canAutoSync =
    autoSyncEnabled && networkAvailable && !!survey && !!user && !isDemoSurvey;

  useEffect(() => {
    if (!canAutoSync) return;

    const intervalId = setInterval(() => {
      dispatch(DataEntryActions.runAutoSync());
    }, AUTO_SYNC_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [canAutoSync, dispatch]);
};
