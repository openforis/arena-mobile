import { RecordCurrentPageEntityPointer } from "model/RecordCurrentPageEntity";

export type PreviousCycleRecordPageEntityPointer = {
  previousCycleEntityUuid?: string | null;
  previousCycleParentEntityUuid?: string | null;
};

export type DataEntryState = {
  record: any;
  recordEditLockAvailable: boolean;
  recordEditLocked: boolean;
  recordCurrentPageEntity: RecordCurrentPageEntityPointer | null;
  activeChildDefIndex?: number;
  recordPageSelectorMenuOpen: boolean;
  linkToPreviousCycleRecord: boolean;
  previousCycleRecordLoading: boolean;
  previousCycleRecord: any;
  previousCycleRecordPageEntity: PreviousCycleRecordPageEntityPointer;
};
