export enum AutoSyncStatus {
  unchecked = "unchecked",
  synced = "synced",
  pending = "pending",
  error = "error",
  // a background auto-sync tick couldn't reach the server because its stored credentials are no
  // longer valid - see AutoSyncActions.authError
  authError = "authError",
  // a status check failed for some other reason (e.g. a server error) - see
  // AutoSyncActions.checkError
  checkError = "checkError",
}

export type AutoSyncState = {
  checking: boolean;
  lastCheckedAt: string | null;
  status: AutoSyncStatus;
};
