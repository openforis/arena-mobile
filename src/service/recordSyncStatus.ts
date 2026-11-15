import { Dates, Objects, Survey } from "@openforis/arena-core";

import type { ArenaMobileRecord } from "model";
import {
  RecordLoadStatus,
  RecordOrigin,
  RecordSummaries,
  RecordSyncStatus,
} from "model";

// record summary as returned by the server
export type RecordSummaryRemote = {
  uuid: string;
  step?: number;
  dateModified?: string;
  readOnly?: boolean;
};

type RecordSyncStatusParams = {
  survey: Survey;
  recordSummaryLocal: ArenaMobileRecord;
  recordSummaryRemote?: RecordSummaryRemote | null;
};

const toDate = (dateStr: string | Date | null | undefined) =>
  dateStr ? new Date(dateStr) : null;

// arena-core parseISO handles a missing date (returns undefined)
const parseISODate = (dateStr: string | undefined) =>
  Dates.parseISO(dateStr as string);

// no baseline captured yet (record never round-tripped under this logic):
// fall back to a plain last-modified comparison
const compareLastModifiedDates = (dateLocal: Date, dateRemote: Date) => {
  if (Dates.isAfter(dateLocal, dateRemote)) {
    return RecordSyncStatus.modifiedLocally;
  }
  if (Dates.isBefore(dateLocal, dateRemote)) {
    return RecordSyncStatus.modifiedRemotely;
  }
  return RecordSyncStatus.notModified;
};

const determineLocalRecordSyncStatus = ({
  survey,
  recordSummaryLocal,
  recordSummaryRemote,
}: RecordSyncStatusParams) => {
  const keyValues = RecordSummaries.getKeyValues({
    survey,
    recordSummary: recordSummaryLocal,
  });
  const keysSpecified = keyValues.every(
    (keyValue) => !Objects.isEmpty(keyValue),
  );
  if (!keysSpecified) {
    return RecordSyncStatus.keysNotSpecified;
  }
  if (!recordSummaryRemote) {
    return RecordSyncStatus.new;
  }
  if (recordSummaryRemote.step! > 1) {
    return RecordSyncStatus.notInEntryStepAnymore;
  }
  if (recordSummaryRemote.uuid !== recordSummaryLocal.uuid) {
    return RecordSyncStatus.conflictingKeys;
  }
  const dateModifiedLocal = toDate(recordSummaryLocal.dateModified);
  const dateModifiedRemoteLive = parseISODate(recordSummaryRemote.dateModified);
  if (!dateModifiedLocal || !dateModifiedRemoteLive) {
    return RecordSyncStatus.notModified;
  }

  // dateModifiedRemote is the server's dateModified as last observed by this
  // device (persisted after a successful upload); it's the baseline that lets us
  // tell "safe to overwrite" apart from a true concurrent-edit conflict, instead
  // of just comparing local vs the live remote value.
  const dateModifiedRemoteBaseline = toDate(
    recordSummaryLocal.dateModifiedRemote,
  );

  if (!dateModifiedRemoteBaseline) {
    return compareLastModifiedDates(dateModifiedLocal, dateModifiedRemoteLive);
  }

  const remoteChangedSinceBaseline = Dates.isAfter(
    dateModifiedRemoteLive,
    dateModifiedRemoteBaseline,
  );
  // compared with a local date, as the clocks can differ (records not synced lately have none)
  const dateModifiedSynced = toDate(recordSummaryLocal.dateModifiedSynced);
  const localChangedSinceBaseline = dateModifiedSynced
    ? dateModifiedLocal.getTime() !== dateModifiedSynced.getTime()
    : Dates.isAfter(dateModifiedLocal, dateModifiedRemoteBaseline);

  if (remoteChangedSinceBaseline && localChangedSinceBaseline) {
    return RecordSyncStatus.modifiedLocallyAndRemotely;
  }
  if (remoteChangedSinceBaseline) {
    return RecordSyncStatus.modifiedRemotely;
  }
  if (localChangedSinceBaseline) {
    // the server skips a record not dated after its own copy
    return Dates.isAfter(dateModifiedLocal, dateModifiedRemoteLive)
      ? RecordSyncStatus.modifiedLocally
      : RecordSyncStatus.deviceDateBehindServer;
  }
  return RecordSyncStatus.notModified;
};

const determineRecordSyncStatus = ({
  survey,
  recordSummaryLocal,
  recordSummaryRemote,
}: RecordSyncStatusParams) => {
  if (recordSummaryLocal.origin === RecordOrigin.local) {
    return determineLocalRecordSyncStatus({
      survey,
      recordSummaryLocal,
      recordSummaryRemote,
    });
  } else if (recordSummaryLocal.loadStatus !== RecordLoadStatus.summary) {
    const dateSynced = toDate(recordSummaryLocal.dateSynced);
    const dateModifiedRemote = parseISODate(recordSummaryRemote?.dateModified);
    if (
      dateSynced &&
      dateModifiedRemote &&
      Dates.isBefore(dateSynced, dateModifiedRemote)
    ) {
      return RecordSyncStatus.notUpToDate;
    }
  }
  return RecordSyncStatus.syncNotApplicable;
};

export const RecordSyncStatusService = {
  determineRecordSyncStatus,
};
