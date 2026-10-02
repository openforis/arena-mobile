import { ArenaRecord } from "@openforis/arena-core";
import { RecordCurrentPageEntityPointer } from "model/RecordCurrentPageEntity";

export type PreviousCycleRecordPageEntityPointer = {
  previousCycleEntityUuid?: string | null;
  previousCycleParentEntityUuid?: string | null;
};

export type DataEntryState = {
  record?: ArenaRecord;
  recordEditLockAvailable: boolean;
  recordEditLocked: boolean;
  // true while the record open in the editor is being merged with its server copy by auto-sync:
  // it can't be edited until the merged version is loaded - see lockOpenRecordForSync
  recordSyncInProgress: boolean;
  recordCurrentPageEntity?: RecordCurrentPageEntityPointer;
  activeChildDefIndex?: number;
  recordPageSelectorMenuOpen: boolean;
  linkToPreviousCycleRecord: boolean;
  previousCycleRecordLoading: boolean;
  previousCycleRecord?: ArenaRecord;
  previousCycleRecordPageEntity: PreviousCycleRecordPageEntityPointer;
};
