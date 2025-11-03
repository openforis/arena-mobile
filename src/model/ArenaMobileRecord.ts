import { ArenaRecord } from "@openforis/arena-core";

import { RecordLoadStatus } from "./RecordLoadStatus";
import { RecordOrigin } from "./RecordOrigin";

export type ArenaMobileRecord = ArenaRecord & {
  dateModifiedRemote?: string;
  dateSynced?: string;
  loadStatus?: RecordLoadStatus;
  origin?: RecordOrigin;
};
