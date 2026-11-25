import type { ArenaSurvey } from "@openforis/arena-core";

import { RecordService } from "service";
import { AutoSyncActions } from "state/autoSync";
import { RemoteConnectionUtils } from "state/remoteConnection/remoteConnectionUtils";
import type { Navigator } from "navigation/navigator";
import { log } from "utils";
import { HttpErrors } from "utils/HttpErrors";
import type { AppDispatch } from "state/store";

import type { RecordSummaryWithSyncStatus } from "model";

type FetchRecordsWithSyncStatusParams = {
  cycle: string | undefined;
  dispatch: AppDispatch;
  navigator: Navigator;
  onlyLocal: boolean;
  survey: (ArenaSurvey & { remoteId?: number }) | undefined;
};

type FetchRecordsWithSyncStatusResult = {
  // only set when the sync status could be fetched
  records?: RecordSummaryWithSyncStatus[];
  syncStatusFetched: boolean;
};

export const fetchRecordsWithSyncStatus = async ({
  cycle,
  dispatch,
  navigator,
  onlyLocal,
  survey,
}: FetchRecordsWithSyncStatusParams): Promise<FetchRecordsWithSyncStatusResult> => {
  dispatch(AutoSyncActions.checkStart());
  try {
    if (
      await RemoteConnectionUtils.checkLoggedInUser({ dispatch, navigator })
    ) {
      // a missing survey fails like any other error (handled below)
      const records = await RecordService.syncRecordSummaries({
        survey: survey!,
        cycle,
        onlyLocal,
      });
      log.debug(
        `fetchRecordsWithSyncStatus: fetched ${records.length} record summary(ies)`,
      );
      dispatch(AutoSyncActions.checkEnd({ records, survey: survey! }));
      return { records, syncStatusFetched: true };
    }
    log.debug("fetchRecordsWithSyncStatus: user not logged in, aborting");
    dispatch(AutoSyncActions.checkAborted());
  } catch (error) {
    // shown through the sync status icon (see AutoSyncActions.checkError) instead of a
    // blocking popup: a popup would otherwise reappear every time an automatic re-check is
    // triggered (screen focus, cycle change, ...) for as long as the underlying problem
    // (e.g. a server error) persists
    log.warn(
      `fetchRecordsWithSyncStatus: error fetching records sync status: ${error}`,
    );
    // same distinction as the background tick (see handleAutoSyncTickError): an expired
    // session gets its own "log in again" status instead of a generic server error
    dispatch(
      HttpErrors.isUnauthorized(error)
        ? AutoSyncActions.authError()
        : AutoSyncActions.checkError(),
    );
  }
  return { syncStatusFetched: false };
};
