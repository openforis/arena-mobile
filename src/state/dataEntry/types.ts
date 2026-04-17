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
  recordCurrentPageEntity?: RecordCurrentPageEntityPointer;
  activeChildDefIndex?: number;
  recordPageSelectorMenuOpen: boolean;
  linkToPreviousCycleRecord: boolean;
  previousCycleRecordLoading: boolean;
  previousCycleRecord?: ArenaRecord;
  previousCycleRecordPageEntity: PreviousCycleRecordPageEntityPointer;
};
