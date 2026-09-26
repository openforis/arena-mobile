export enum AutoSyncStatus {
  unchecked = "unchecked",
  synced = "synced",
  pending = "pending",
  // some records need an explicit merge decision through "Send data" (see computeAutoSyncStatus)
  error = "error",
  // some records can't be synchronized nor merged until the user fixes them (e.g. missing key
  // values, or same keys as another record on the server when the survey doesn't allow merging)
  needsManualFix = "needsManualFix",
  // a background auto-sync tick couldn't reach the server because its stored credentials are no
  // longer valid - see AutoSyncActions.authError
  authError = "authError",
  // a status check failed for some other reason (e.g. a server error) - see
  // AutoSyncActions.checkError
  checkError = "checkError",
}

export type AutoSyncMessage = {
  textKey: string;
  textParams?: Record<string, any>;
} | null;

export type AutoSyncState = {
  checking: boolean;
  lastCheckedAt: string | null;
  status: AutoSyncStatus;
  // a short, more specific note about the last completed tick/check than `status` alone
  // conveys (e.g. "nothing to send right now") - see AutoSyncActions.setMessage
  message: AutoSyncMessage;
  // when a record was last created/edited locally (see AutoSyncActions.markPending) - compared
  // against lastCheckedAt to tell whether a completed check is still up to date, or something
  // new has happened since that a focus-triggered re-check shouldn't skip - see
  // useRecordsList.checkAutoSyncStatusIfNeeded
  lastLocalChangeAt: string | null;
  // the last check found records with the same key(s) as a record on the server, but the survey
  // doesn't allow merging them - see hasConflictingKeysWithMergeNotAllowed
  conflictingKeysWithMergeNotAllowed: boolean;
  // true while the auto-sync status dialog is open - see AutoSyncStatusDialog
  dialogOpen: boolean;
};
