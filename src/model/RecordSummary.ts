import { ArenaMobileRecord } from "./ArenaMobileRecord";

// key or summary attribute values by node def name
export type RecordSummaryValues = Record<string, unknown>;

// record read from the device db (with or without content)
export type RecordSummary = ArenaMobileRecord & {
  keysObj?: RecordSummaryValues;
  summaryAttributesObj?: RecordSummaryValues;
};

// record summary fetched from the server
export type RemoteRecordSummary = {
  uuid: string;
  cycle: string;
  dateCreated?: string | number;
  dateModified?: string | number;
  ownerUuid?: string;
  ownerName?: string;
  readOnly?: boolean;
  keysObj?: RecordSummaryValues;
  summaryAttributesObj?: RecordSummaryValues;
};
