export enum AutoSyncStatus {
  unchecked = "unchecked",
  synced = "synced",
  pending = "pending",
  error = "error",
}

export type AutoSyncState = {
  checking: boolean;
  lastCheckedAt: string | null;
  status: AutoSyncStatus;
};
