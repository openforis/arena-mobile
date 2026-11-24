import type { ArenaRecordSummary } from "@openforis/arena-core";

import { ArenaMobileRecord } from "./ArenaMobileRecord";

// key or summary attribute values by node def name
export type RecordSummaryValues = Record<string, unknown>;

// record read from the device db (with or without content)
export type RecordSummary = ArenaMobileRecord & {
  keysObj?: RecordSummaryValues;
  summaryAttributesObj?: RecordSummaryValues;
};

// record summary in the records list: the sync status is set only when compared with the server
export type RecordSummaryWithSyncStatus = RecordSummary & {
  syncStatus?: string;
};

// record summary fetched from the server
export type RemoteRecordSummary = ArenaRecordSummary;
