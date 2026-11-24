import { ArenaSurvey } from "@openforis/arena-core";

import { RecordLoadStatus, RecordOrigin, RecordSummaries } from "model";
import type { ArenaMobileRecord, RecordSummaryWithSyncStatus } from "model";
import { ArrayUtils } from "utils";

import { RecordRepository } from "./repository/recordRepository";
import { RecordRemoteService } from "./recordRemoteService";
import {
  RecordSummaryRemote,
  RecordSyncStatusService,
} from "./recordSyncStatus";

type RecordsSyncSurvey = ArenaSurvey & { remoteId?: number };

const {
  fetchRecords,
  insertRecordSummaries,
  updateRecordsDateSync,
  updateRecordsDateModifiedRemote,
  updateRecordsDateModifiedSynced,
  deleteRecords,
} = RecordRepository;

const { fetchRecordsSummaries: fetchRecordsSummariesRemoteServer } =
  RecordRemoteService;

const identifyAndDeleteRecordsNotInRemoteServer = async ({
  surveyId,
  allRecordsSummariesInDevice,
  recordsSummariesRemoteByUuid,
}: {
  allRecordsSummariesInDevice: ArenaMobileRecord[];
  recordsSummariesRemoteByUuid: Record<string, RecordSummaryRemote>;
  surveyId: number | undefined;
}) => {
  const recordsSummariesLocalToDelete = allRecordsSummariesInDevice.filter(
    (
      recordSummaryLocal: ArenaMobileRecord, // record summary is not locally modified and is no more in server
    ) =>
      recordSummaryLocal.origin === RecordOrigin.remote &&
      recordSummaryLocal.loadStatus === RecordLoadStatus.summary &&
      !recordsSummariesRemoteByUuid[recordSummaryLocal.uuid],
  );
  if (recordsSummariesLocalToDelete.length > 0) {
    try {
      await deleteRecords({
        surveyId,
        recordUuids: recordsSummariesLocalToDelete.map(
          (record: ArenaMobileRecord) => record.uuid,
        ),
      });
    } catch (error) {
      throw new Error(
        `error deleting local record summaries. Details: ${error}`,
        { cause: error },
      );
    }
  }
};

const findAndInsertNewRecordSummariesLocally = async ({
  survey,
  cycle,
  allRecordsSummariesInDevice,
  recordsSummariesRemote,
}: {
  survey: RecordsSyncSurvey;
  cycle?: string | null;
  allRecordsSummariesInDevice: ArenaMobileRecord[];
  recordsSummariesRemote: RecordSummaryRemote[];
}) => {
  // records to add are remote records not in local db
  const recordsSummariesLocalByUuid = ArrayUtils.indexByUuid(
    allRecordsSummariesInDevice,
  );
  const recordSummariesToAdd = recordsSummariesRemote.filter(
    (recordSummaryRemote) =>
      !recordsSummariesLocalByUuid[recordSummaryRemote.uuid],
  );
  if (recordSummariesToAdd.length === 0) {
    return;
  }
  try {
    await insertRecordSummaries({
      survey,
      cycle,
      recordSummaries: recordSummariesToAdd,
    });
  } catch (error) {
    throw new Error(`error inserting new record summaries. Details: ${error}`, {
      cause: error,
    });
  }
};

type LocalRecordsRemoteInfoParams = {
  allRecordsSummariesInDevice: ArenaMobileRecord[];
  recordsSummariesRemoteByUuid: Record<string, RecordSummaryRemote>;
  survey: RecordsSyncSurvey;
};

const updateLocalRecordsWithRemoteInfo = async ({
  allRecordsSummariesInDevice,
  recordsSummariesRemoteByUuid,
  survey,
}: LocalRecordsRemoteInfoParams) => {
  const recordSummaries = allRecordsSummariesInDevice
    .filter(
      ({ origin, loadStatus }) =>
        origin === RecordOrigin.remote &&
        loadStatus === RecordLoadStatus.summary,
    )
    .map(({ uuid }) => recordsSummariesRemoteByUuid[uuid])
    .filter((summary): summary is RecordSummaryRemote => !!summary);
  await RecordRepository.updateRecordsKeysAndDateModifiedWithSummariesFetchedRemotely(
    { survey, recordSummaries },
  );
  await updateLocalRecordsReadOnly({
    survey,
    allRecordsSummariesInDevice,
    recordsSummariesRemoteByUuid,
  });
};

// the user group settings on the server can change: keep the read-only flag of all the records in sync
const updateLocalRecordsReadOnly = async ({
  allRecordsSummariesInDevice,
  recordsSummariesRemoteByUuid,
  survey,
}: LocalRecordsRemoteInfoParams) => {
  const readOnlyUuids: string[] = [];
  const editableUuids: string[] = [];
  for (const recordSummaryLocal of allRecordsSummariesInDevice) {
    const { uuid } = recordSummaryLocal;
    const recordSummaryRemote = recordsSummariesRemoteByUuid[uuid];
    if (!recordSummaryRemote) continue;
    const readOnly = !!recordSummaryRemote.readOnly;
    if (readOnly !== !!recordSummaryLocal.readOnly) {
      (readOnly ? readOnlyUuids : editableUuids).push(uuid);
    }
  }
  const surveyId = survey.id!;
  await RecordRepository.updateRecordsReadOnly({
    surveyId,
    recordUuids: readOnlyUuids,
    readOnly: true,
  });
  await RecordRepository.updateRecordsReadOnly({
    surveyId,
    recordUuids: editableUuids,
    readOnly: false,
  });
};

const syncRecordSummaries = async ({
  survey,
  cycle,
  onlyLocal,
}: {
  survey: RecordsSyncSurvey;
  cycle?: string | null;
  onlyLocal?: boolean;
}): Promise<RecordSummaryWithSyncStatus[]> => {
  const { id: surveyId } = survey;

  let allRecordsSummariesInDevice: ArenaMobileRecord[];
  try {
    allRecordsSummariesInDevice = await fetchRecords({
      survey,
      cycle,
      onlyLocal: false,
    });
  } catch (error) {
    throw new Error(
      `error fetching full local records list. Details: ${error}`,
      { cause: error },
    );
  }

  let recordsSummariesRemote: RecordSummaryRemote[];
  try {
    recordsSummariesRemote = await fetchRecordsSummariesRemoteServer({
      surveyRemoteId: survey.remoteId,
      cycle,
    });
  } catch (error) {
    const wrappedError: Error & { status?: number } = new Error(
      `error fetching remote records summaries. Details: ${error}`,
      { cause: error },
    );
    // preserve the original HTTP status (e.g. 401), lost otherwise by wrapping - callers use
    // it to tell an expired session apart from any other failure (see auto-sync)
    wrappedError.status = (
      error as { response?: { status?: number } } | undefined
    )?.response?.status;
    throw wrappedError;
  }

  const recordsSummariesRemoteByUuid = ArrayUtils.indexByUuid(
    recordsSummariesRemote,
  );

  await identifyAndDeleteRecordsNotInRemoteServer({
    surveyId,
    allRecordsSummariesInDevice,
    recordsSummariesRemoteByUuid,
  });

  await findAndInsertNewRecordSummariesLocally({
    survey,
    cycle,
    recordsSummariesRemote,
    allRecordsSummariesInDevice,
  });

  await updateLocalRecordsWithRemoteInfo({
    survey,
    allRecordsSummariesInDevice,
    recordsSummariesRemoteByUuid,
  });

  let recordsSummariesLocalReloaded: RecordSummaryWithSyncStatus[];
  try {
    recordsSummariesLocalReloaded = await fetchRecords({
      survey,
      cycle,
      onlyLocal,
    });
  } catch (error) {
    throw new Error(`error fetching updated local records. Details: ${error}`, {
      cause: error,
    });
  }

  const toKeyValuesFormattedId = (
    recordSummary: ArenaMobileRecord | RecordSummaryRemote,
  ) =>
    JSON.stringify(
      RecordSummaries.getKeyValuesFormatted({ survey, recordSummary }),
    );
  const recordsSummariesRemoteByKeyValues = new Map<
    string,
    RecordSummaryRemote
  >();
  for (const recordSummary of recordsSummariesRemote) {
    const keyValuesId = toKeyValuesFormattedId(recordSummary);
    if (!recordsSummariesRemoteByKeyValues.has(keyValuesId)) {
      recordsSummariesRemoteByKeyValues.set(keyValuesId, recordSummary);
    }
  }

  return recordsSummariesLocalReloaded.map((recordSummaryLocal) => {
    const recordSummaryRemote =
      recordsSummariesRemoteByUuid[recordSummaryLocal.uuid] ??
      recordsSummariesRemoteByKeyValues.get(
        toKeyValuesFormattedId(recordSummaryLocal),
      );
    const syncStatus = RecordSyncStatusService.determineRecordSyncStatus({
      survey,
      recordSummaryLocal,
      recordSummaryRemote,
    });
    recordSummaryLocal.syncStatus = syncStatus;
    return recordSummaryLocal;
  });
};

/**
 * Called right after a successful upload of the given records: fetches their
 * current remote summaries and stamps date_synced and date_modified_remote
 * (the "last known server state" baseline) so that the next sync-status check
 * can distinguish a safe overwrite from a real concurrent-edit conflict.
 */
const confirmRecordsSyncedWithRemote = async ({
  survey,
  cycle,
  recordUuids,
  dateModifiedByUuid,
}: {
  survey: RecordsSyncSurvey;
  cycle?: string | null;
  recordUuids: string[];
  // local dateModified read before the export (null/undefined if not found)
  dateModifiedByUuid: Record<string, string | null | undefined>;
}) => {
  const { id: surveyId } = survey;

  let recordsSummariesRemote: RecordSummaryRemote[];
  try {
    recordsSummariesRemote = await fetchRecordsSummariesRemoteServer({
      surveyRemoteId: survey.remoteId,
      cycle,
    });
  } catch (error) {
    throw new Error(
      `error fetching remote records summaries after upload. Details: ${error}`,
      { cause: error },
    );
  }

  const recordsSummariesRemoteByUuid = ArrayUtils.indexByUuid(
    recordsSummariesRemote,
  );
  const dateModifiedRemoteByUuid: Record<string, string> = {};
  for (const uuid of recordUuids) {
    const recordSummaryRemote = recordsSummariesRemoteByUuid[uuid];
    if (recordSummaryRemote?.dateModified) {
      dateModifiedRemoteByUuid[uuid] = recordSummaryRemote.dateModified;
    }
  }

  await updateRecordsDateSync({ surveyId, recordUuids });
  await updateRecordsDateModifiedSynced({ surveyId, dateModifiedByUuid });

  if (Object.keys(dateModifiedRemoteByUuid).length > 0) {
    await updateRecordsDateModifiedRemote({
      surveyId,
      dateModifiedRemoteByUuid,
    });
  }
};

export const RecordSyncService = {
  determineRecordSyncStatus: RecordSyncStatusService.determineRecordSyncStatus,
  syncRecordSummaries,
  confirmRecordsSyncedWithRemote,
  // remote server
  startExportRecordsFromRemoteServer: RecordRemoteService.startExportRecords,
  downloadExportedRecordsFileFromRemoteServer:
    RecordRemoteService.downloadExportedRecordsFile,
  uploadRecordsToRemoteServer: RecordRemoteService.uploadRecords,
};
