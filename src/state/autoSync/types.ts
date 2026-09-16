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
};
