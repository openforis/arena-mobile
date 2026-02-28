import { RecordCurrentPageEntity } from "model/RecordCurrentPageEntity";

export type DataEntryState = {
  record: any;
  recordEditLockAvailable: boolean;
  recordEditLocked: boolean;
  recordCurrentPageEntity: RecordCurrentPageEntity | null;
  activeChildDefIndex?: number;
  recordPageSelectorMenuOpen: boolean;
  linkToPreviousCycleRecord: boolean;
  previousCycleRecordLoading: boolean;
  previousCycleRecord: any;
  previousCycleRecordPageEntity?: RecordCurrentPageEntity | null;
};
