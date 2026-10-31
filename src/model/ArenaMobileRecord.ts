import { ArenaRecord } from "@openforis/arena-core";

import { RecordLoadStatus } from "./RecordLoadStatus";
import { RecordOrigin } from "./RecordOrigin";

export type ArenaMobileRecord = ArenaRecord & {
  dateModifiedRemote?: string;
  dateModifiedSynced?: string;
  dateSynced?: string;
  loadStatus?: RecordLoadStatus;
  origin?: RecordOrigin;
  // record of another user group: it can be viewed or cloned, but not edited or uploaded
  readOnly?: boolean;
};
