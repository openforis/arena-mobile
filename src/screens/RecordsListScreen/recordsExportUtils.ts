import { ArenaSurvey, Surveys, ArenaValidation } from "@openforis/arena-core";

import {
  RecordOrigin,
  RecordSummaries,
  RecordSyncStatus,
  RecordUpdateConflictResolutionStrategy as ConflictResolutionStrategy,
} from "model";

// the fields of a record summary (with sync status) read by the export flow
export type ExportRecord = {
  uuid: string;
  origin?: string;
  readOnly?: boolean;
  syncStatus?: string;
  validation?: ArenaValidation | null;
};

export type RecordsExportGroups<R extends ExportRecord = ExportRecord> = {
  newRecords: R[];
  updatedRecords: R[];
  conflictingRecords: R[];
  sameRecordConflicts: R[];
};

// records also modified on the server since this device last synced them: exported only if the user
// opts into merging them with the server's changes. modifiedLocallyAndRemotely means both sides
// diverged since the last known baseline (the merge could silently drop one side's edit);
// modifiedRemotely is the only signal the server moved for a record without a baseline yet.
const sameRecordConflictStatuses = new Set<string>([
  RecordSyncStatus.modifiedRemotely,
  RecordSyncStatus.modifiedLocallyAndRemotely,
]);

export const filterRecordsByUuids = <R extends { uuid: string }>(
  records: R[],
  recordUuids: string[] | undefined,
): R[] =>
  recordUuids && recordUuids.length > 0
    ? records.filter((record) => recordUuids.includes(record.uuid))
    : records;

export const getLocalRecordUuids = (records: ExportRecord[]): string[] =>
  records
    .filter((record) => record.origin === RecordOrigin.local)
    .map((record) => record.uuid);

// error message key if the records cannot be sent to the server
export const checkCanSendData = ({
  survey,
  records,
  selectedRecordUuids,
}: {
  survey: ArenaSurvey | undefined;
  records: ExportRecord[];
  selectedRecordUuids?: string[];
}): string | undefined => {
  if (!survey) {
    return "recordsList:sendData.error.surveyNotSelected";
  }
  if (!Surveys.isVisibleInMobile(survey)) {
    return "recordsList:sendData.error.surveyNotVisibleInMobile";
  }
  if (!Surveys.isRecordsUploadFromMobileAllowed(survey)) {
    return "recordsList:sendData.error.recordsUploadNotAllowed";
  }
  if (
    !Surveys.isRecordsWithErrorsUploadFromMobileAllowed(survey) &&
    filterRecordsByUuids(records, selectedRecordUuids).some(
      RecordSummaries.hasErrors,
    )
  ) {
    return "recordsList:sendData.error.recordsWithErrorsUploadNotAllowed";
  }
  return undefined;
};

// records of other user groups (read only) cannot be uploaded
export const groupRecordsForExport = <R extends ExportRecord>(
  records: R[],
): RecordsExportGroups<R> => {
  const uploadable = records.filter((record) => !record.readOnly);
  const withStatus = (status: string) =>
    uploadable.filter((record) => record.syncStatus === status);
  return {
    newRecords: withStatus(RecordSyncStatus.new),
    updatedRecords: withStatus(RecordSyncStatus.modifiedLocally),
    conflictingRecords: withStatus(RecordSyncStatus.conflictingKeys),
    sameRecordConflicts: uploadable.filter(
      (record) =>
        !!record.syncStatus &&
        sameRecordConflictStatuses.has(record.syncStatus),
    ),
  };
};

export const isNothingToExport = (groups: RecordsExportGroups): boolean =>
  Object.values(groups).every((group) => group.length === 0);

// the survey may not allow merging records with the same key(s) (survey security option): those
// records then can't be sent at all, the user has to change their key values first
export const hasMergeableConflicts = ({
  groups,
  mergeWithSameKeysAllowed,
}: {
  groups: RecordsExportGroups;
  mergeWithSameKeysAllowed: boolean;
}): boolean =>
  groups.sameRecordConflicts.length > 0 ||
  (mergeWithSameKeysAllowed && groups.conflictingRecords.length > 0);

// counts by record status label (see dataEntry:recordStatus)
export const buildRecordsCountSummary = ({
  groups,
  records,
}: {
  groups: RecordsExportGroups;
  records: ExportRecord[];
}): Record<string, number> => ({
  new: groups.newRecords.length,
  updated: groups.updatedRecords.length,
  conflicting: groups.conflictingRecords.length,
  conflictingModifiedRemotely: groups.sameRecordConflicts.length,
  withValidationErrors: records.filter(RecordSummaries.hasErrors).length,
});

export const selectRecordsToExport = ({
  groups,
  mergeSelected,
  mergeWithSameKeysAllowed,
}: {
  groups: RecordsExportGroups;
  mergeSelected: boolean;
  mergeWithSameKeysAllowed: boolean;
}): { recordUuids: string[]; conflictResolutionStrategy: string } => {
  const recordsToExport = [...groups.newRecords, ...groups.updatedRecords];
  if (mergeSelected) {
    if (mergeWithSameKeysAllowed) {
      recordsToExport.push(...groups.conflictingRecords);
    }
    recordsToExport.push(...groups.sameRecordConflicts);
  }
  return {
    recordUuids: recordsToExport.map((record) => record.uuid),
    conflictResolutionStrategy: mergeSelected
      ? ConflictResolutionStrategy.merge
      : ConflictResolutionStrategy.overwriteIfUpdated,
  };
};
