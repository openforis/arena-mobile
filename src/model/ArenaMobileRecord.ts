import { Record } from "@openforis/arena-core";

import { RecordLoadStatus } from "./RecordLoadStatus";
import { RecordOrigin } from "./RecordOrigin";

export type ArenaMobileRecord = Record & {
  dateModifiedRemote?: string;
  dateSynced?: string;
  loadStatus?: RecordLoadStatus;
  origin?: RecordOrigin;
};
