import { Keyboard } from "react-native";

import { Records, Surveys } from "@openforis/arena-core";

import { RecordService } from "service/recordService";
import { log } from "utils";

import { SurveySelectors } from "../survey/selectors";
import { DataEntryActionTypes } from "./actionTypes";
import { DataEntrySelectors } from "./selectors";

const { PAGE_ENTITY_SET, RECORD_SET, RECORD_SYNC_IN_PROGRESS_SET } =
  DataEntryActionTypes;

// > 0 while a completed upload is still being followed up on (sync dates being stamped, merged
// records being fetched back - see exportRecords' onJobComplete): the job monitor is already
// closed (or about to be reopened) at that point, so it can't be what tells auto-sync to wait
let postUploadProcessingCount = 0;

const isPostUploadProcessingInProgress = () => postUploadProcessingCount > 0;

const runAsPostUploadProcessing = async (fn: () => Promise<void>) => {
  postUploadProcessingCount++;
  try {
    await fn();
  } finally {
    postUploadProcessingCount--;
  }
};

// uuids of the records whose local copy is being replaced, unattended, by the version merged on
// the server (see exportRecords): such a record must not be opened in the editor until that's
// done, or the editor would start from content about to be replaced underneath it
const recordUuidsBeingReplaced = new Set<string>();

const isRecordBeingReplaced = (recordUuid: string) =>
  recordUuidsBeingReplaced.has(recordUuid);

const runReplacingRecords = async (
  recordUuids: string[],
  fn: () => Promise<void>,
) => {
  for (const uuid of recordUuids) recordUuidsBeingReplaced.add(uuid);
  try {
    await fn();
  } finally {
    for (const uuid of recordUuids) recordUuidsBeingReplaced.delete(uuid);
  }
};

// the lock is released by whoever took it (see runAutoSync) once the merged record is loaded in
// the editor; this covers every other way the upload can end (failed, canceled, ...) without
// each of them having to know about it: nothing has been running for two checks in a row
const SYNC_LOCK_WATCHDOG_INTERVAL_MS = 3000;
let syncLockWatchdogId: ReturnType<typeof setInterval> | null = null;

const stopSyncLockWatchdog = () => {
  if (syncLockWatchdogId) {
    clearInterval(syncLockWatchdogId);
    syncLockWatchdogId = null;
  }
};

const unlockOpenRecordAfterSync = () => (dispatch: any, getState: any) => {
  stopSyncLockWatchdog();
  if (DataEntrySelectors.selectRecordSyncInProgress(getState())) {
    dispatch({ type: RECORD_SYNC_IN_PROGRESS_SET, inProgress: false });
  }
};

/**
 * Makes the record open in the editor read-only while it's being merged with its server copy:
 * the editor holds the record in memory and stores it as a whole at every edit, so an edit made
 * in the meantime would overwrite the merged version (see reloadOpenRecord).
 * `isBusy`: tells whether the caller is still working on it, besides what can be seen from here
 * (a job running in the job monitor, an upload being followed up on) - see the watchdog above.
 */
const lockOpenRecordForSync =
  ({ isBusy }: { isBusy?: () => boolean } = {}) =>
  (dispatch: any, getState: any) => {
    Keyboard.dismiss();
    dispatch({ type: RECORD_SYNC_IN_PROGRESS_SET, inProgress: true });

    stopSyncLockWatchdog();
    let idleChecks = 0;
    syncLockWatchdogId = setInterval(() => {
      const busy =
        !!isBusy?.() || getState().jobMonitor.isOpen || isPostUploadProcessingInProgress();
      idleChecks = busy ? 0 : idleChecks + 1;
      if (idleChecks >= 2) {
        log.debug("record sync lock: nothing running anymore, releasing it");
        dispatch(unlockOpenRecordAfterSync());
      }
    }, SYNC_LOCK_WATCHDOG_INTERVAL_MS);
  };

const isPageEntityPointerValid = ({ survey, record, pointer }: any) => {
  const { parentEntityUuid, entityDefUuid, entityUuid } = pointer;
  return (
    !!Surveys.findNodeDefByUuid({ survey, uuid: entityDefUuid }) &&
    !!Records.getNodeByUuid(parentEntityUuid)(record) &&
    (!entityUuid || !!Records.getNodeByUuid(entityUuid)(record))
  );
};

/**
 * Loads again from the device storage the record open in the editor, after its stored copy has
 * been replaced (by the version merged on the server). The current page is kept if it still
 * exists in the record, otherwise the editor goes back to the root entity page.
 */
const reloadOpenRecord = () => async (dispatch: any, getState: any) => {
  const state = getState();
  const survey = SurveySelectors.selectCurrentSurvey(state);
  const recordOpen = DataEntrySelectors.selectRecord(state);
  if (!survey || !recordOpen) return;

  const record = await RecordService.fetchRecord({
    survey,
    recordId: recordOpen.id,
  });

  const stateNext = getState();
  if (DataEntrySelectors.selectRecord(stateNext)?.uuid !== record.uuid) {
    // the editor has been closed, or another record opened, in the meantime
    return;
  }
  const pointer = stateNext.dataEntry.recordCurrentPageEntity;
  if (
    pointer?.parentEntityUuid &&
    !isPageEntityPointerValid({ survey, record, pointer })
  ) {
    dispatch({ type: PAGE_ENTITY_SET, payload: undefined });
  }
  dispatch({ type: RECORD_SET, record });
  log.debug(`record ${record.uuid} reloaded in the editor`);
};

export const DataEntryActionsRecordSync = {
  isPostUploadProcessingInProgress,
  isRecordBeingReplaced,
  lockOpenRecordForSync,
  reloadOpenRecord,
  runAsPostUploadProcessing,
  runReplacingRecords,
  unlockOpenRecordAfterSync,
};
