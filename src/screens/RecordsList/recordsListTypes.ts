import type { RecordSummary } from "model";

// record summary loaded in the records list: the sync status is set only when fetched from the server
export type RecordSummaryWithSyncStatus = RecordSummary & {
  syncStatus?: string;
};
