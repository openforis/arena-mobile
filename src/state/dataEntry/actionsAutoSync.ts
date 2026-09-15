import { Surveys } from "@openforis/arena-core";

import {
  RecordSyncStatus,
  RecordUpdateConflictResolutionStrategy as ConflictResolutionStrategy,
} from "model";
import { RecordService } from "service";
import { log } from "utils";

import { SurveySelectors } from "../survey";
import { ToastActions } from "../toast";
import { exportRecords } from "./actionsDataExport";
import { DataEntrySelectors } from "./selectors";

// records must have been idle (untouched) for at least this long before auto-sync will
// upload them, so a record that's still actively being edited is never touched
const AUTO_SYNC_IDLE_THRESHOLD_MS = 60_000; // 1 minute

// syncStatus values that are safe to upload without any user confirmation: no merge, no
// overwrite of someone else's edit (mirrors the default "overwriteIfUpdated" bucket the
// manual "Send data" flow uses). Anything else (conflicting keys, modified on the server too)
// is deliberately left out here - those need the explicit merge confirmation the manual flow
// already has.
const autoSyncSafeStatuses = new Set([RecordSyncStatus.new, RecordSyncStatus.modifiedLocally]);

// guards against overlapping ticks (e.g. a slow network making one tick outlive the interval)
let tickInProgress = false;

const selectAutoSyncCandidates = ({ records, survey, currentlyEditedRecordUuid }: any) => {
  const errorsAllowed = Surveys.isRecordsWithErrorsUploadFromMobileAllowed(survey);
  const now = Date.now();

  return records.filter((record: any) => {
    if (!autoSyncSafeStatuses.has(record.syncStatus)) return false;
    if (record.uuid === currentlyEditedRecordUuid) return false;
    if (!errorsAllowed && record.errors > 0) return false;

    const dateModified = record.dateModified ? new Date(record.dateModified) : null;
    if (!dateModified) return false;
    return now - dateModified.getTime() > AUTO_SYNC_IDLE_THRESHOLD_MS;
  });
};

/**
 * One auto-sync tick: uploads, without any user interaction, the local records that are
 * both idle (not being edited right now) and free of any conflict with the server. Records
 * that need a merge decision, or that are still being edited, are left untouched for the
 * user to review/send manually. See the "Auto sync" checkbox in RecordsListOptions.
 */
const runAutoSync = () => async (dispatch: any, getState: any) => {
  if (tickInProgress) return;

  const state = getState();
  if (state.jobMonitor.isOpen) return; // a manual export/import/upload is already running

  const survey = SurveySelectors.selectCurrentSurvey(state);
  const cycle = SurveySelectors.selectCurrentSurveyCycle(state);
  if (!survey || !Surveys.isRecordsUploadFromMobileAllowed(survey)) return;

  tickInProgress = true;
  try {
    const records = await RecordService.syncRecordSummaries({
      survey,
      cycle,
      onlyLocal: false,
    });

    const currentlyEditedRecordUuid = DataEntrySelectors.selectRecord(getState())?.uuid;

    const candidates = selectAutoSyncCandidates({
      records,
      survey,
      currentlyEditedRecordUuid,
    });
    if (candidates.length === 0) return;

    log.debug(`auto-sync: uploading ${candidates.length} record(s)`);

    const onJobComplete = () => {
      dispatch(ToastActions.show("dataEntry:autoSync.synced", { count: candidates.length }));
    };

    // fire-and-forget, like the manual "Send data" flow: exportRecords resolves once the
    // upload has been handed off (it drives its own progress/completion internally via
    // onJobComplete), it does not await the remote upload finishing
    await dispatch(
      exportRecords({
        cycle,
        recordUuids: candidates.map((record: any) => record.uuid),
        conflictResolutionStrategy: ConflictResolutionStrategy.overwriteIfUpdated,
        onlyRemote: true,
        onJobComplete,
        silent: true,
      }),
    );
  } catch (error) {
    // best-effort background operation: log and let the next tick retry
    log.warn(`auto-sync tick failed: ${error}`);
  } finally {
    tickInProgress = false;
  }
};

export { runAutoSync };
