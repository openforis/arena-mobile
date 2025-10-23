import {
  Dates,
  Objects,
  RecordCloner,
  Records,
  Surveys,
} from "@openforis/arena-core";

import {
  RecordLoadStatus,
  RecordNodes,
  RecordOrigin,
  RecordSummaries,
  RecordSyncStatus,
} from "model";
import { ArrayUtils } from "utils";

import { RecordRepository } from "./repository/recordRepository";
import { RecordRemoteService } from "./recordRemoteService";
import { RecordFileService } from "./recordFileService";

const {
  fetchRecord,
  fetchRecordSummary,
  fetchRecords,
  fetchRecordsWithEmptyCycle,
  insertRecord,
  insertRecordSummaries,
  updateRecord,
  updateRecordWithContentFetchedRemotely,
  updateRecordsDateSync,
  updateRecordsMergedInto,
  deleteRecords,
  fixRecordCycle,
} = RecordRepository;

const {
  fetchRecordsSummaries: fetchRecordsSummariesRemoteServer,
  startExportRecords: startExportRecordsFromRemoteServer,
  downloadExportedRecordsFile: downloadExportedRecordsFileFromRemoteServer,
  uploadRecords: uploadRecordsToRemoteServer,
} = RecordRemoteService;

const toDate = (dateStr: any) => dateStr ? new Date(dateStr) : null;

const determineLocalRecordSyncStatus = ({
  survey,
  recordSummaryLocal,
  recordSummaryRemote
}: any) => {
  const keyValues = RecordSummaries.getKeyValues({
    survey,
    recordSummary: recordSummaryLocal,
  });
  const keysSpecified = keyValues.every((keyValue) => !!keyValue);
  if (!keysSpecified) {
    return RecordSyncStatus.keysNotSpecified;
  }
  if (!recordSummaryRemote) {
    return RecordSyncStatus.new;
  }
  if (recordSummaryRemote.step > 1) {
    return RecordSyncStatus.notInEntryStepAnymore;
  }
  if (recordSummaryRemote.uuid !== recordSummaryLocal.uuid) {
    return RecordSyncStatus.conflictingKeys;
  }
  const dateModifiedLocal = toDate(recordSummaryLocal.dateModified);
  const dateModifiedRemote = Dates.parseISO(recordSummaryRemote.dateModified);

  // @ts-expect-error TS(2345): Argument of type 'Date | null' is not assignable t... Remove this comment to see the full error message
  if (Dates.isAfter(dateModifiedLocal, dateModifiedRemote)) {
    return RecordSyncStatus.modifiedLocally;
  }
  // @ts-expect-error TS(2345): Argument of type 'Date | null' is not assignable t... Remove this comment to see the full error message
  if (Dates.isBefore(dateModifiedLocal, dateModifiedRemote)) {
    return RecordSyncStatus.modifiedRemotely;
  }
  return RecordSyncStatus.notModified;
};

const determineRecordSyncStatus = ({
  survey,
  recordSummaryLocal,
  recordSummaryRemote
}: any) => {
  if (recordSummaryLocal.origin === RecordOrigin.local) {
    return determineLocalRecordSyncStatus({
      survey,
      recordSummaryLocal,
      recordSummaryRemote,
    });
  } else if (recordSummaryLocal.loadStatus !== RecordLoadStatus.summary) {
    const dateSynced = toDate(recordSummaryLocal.dateSynced);
    const dateModifiedRemote = Dates.parseISO(
      recordSummaryRemote?.dateModified
    );
    // @ts-expect-error TS(2345): Argument of type 'Date | null' is not assignable t... Remove this comment to see the full error message
    if (Dates.isBefore(dateSynced, dateModifiedRemote)) {
      return RecordSyncStatus.notUpToDate;
    }
  }
  return RecordSyncStatus.syncNotApplicable;
};

const syncRecordSummaries = async ({
  survey,
  cycle,
  onlyLocal
}: any) => {
  const { id: surveyId } = survey;

  let allRecordsSummariesInDevice: any;
  try {
    allRecordsSummariesInDevice = await fetchRecords({
      survey,
      cycle,
      onlyLocal: false,
    });
  } catch (error) {
    throw new Error(
      `error fetching full local records list. Details: ${error}`
    );
  }

  let recordsSummariesRemote: any;
  try {
    recordsSummariesRemote = await fetchRecordsSummariesRemoteServer({
      surveyRemoteId: survey.remoteId,
      cycle,
    });
  } catch (error) {
    throw new Error(
      `error fetching remote records summaries. Details: ${error}`
    );
  }

  const recordsSummariesLocalToDelete = allRecordsSummariesInDevice.filter(
    (recordSummaryLocal: any) => // record summary is not locally modified and is no more in server
    recordSummaryLocal.origin === RecordOrigin.remote &&
    recordSummaryLocal.loadStatus === RecordLoadStatus.summary &&
    !ArrayUtils.findByUuid(recordSummaryLocal.uuid)(recordsSummariesRemote)
  );
  if (recordsSummariesLocalToDelete.length > 0) {
    try {
      await deleteRecords({
        surveyId,
        recordUuids: recordsSummariesLocalToDelete.map((record: any) => record.uuid),
      });
    } catch (error) {
      throw new Error(
        `error deleting local record summaries. Details: ${error}`
      );
    }
  }

  const recordSummariesToAdd = recordsSummariesRemote.filter(
    (recordSummaryRemote: any) => // remote records not in local db
    !ArrayUtils.findByUuid(recordSummaryRemote.uuid)(
      allRecordsSummariesInDevice
    )
  );
  if (recordSummariesToAdd.length > 0) {
    try {
      await insertRecordSummaries({
        survey,
        cycle,
        recordSummaries: recordSummariesToAdd,
      });
    } catch (error) {
      throw new Error(
        `error inserting new record summaries. Details: ${error}`
      );
    }
  }

  for await (const recordSummaryLocal of allRecordsSummariesInDevice) {
    const { origin, loadStatus, uuid } = recordSummaryLocal;
    const recordSummaryRemote = ArrayUtils.findByUuid(uuid)(
      recordsSummariesRemote
    );
    if (
      origin === RecordOrigin.remote &&
      loadStatus === RecordLoadStatus.summary &&
      recordSummaryRemote
    ) {
      try {
        await RecordRepository.updateRecordKeysAndDateModifiedWithSummaryFetchedRemotely(
          { survey, recordSummary: recordSummaryRemote }
        );
      } catch (error) {
        throw new Error(
          `error updating local record keys for record ${uuid}. Details: ${error}`
        );
      }
    }
  }

  let recordsSummariesLocalReloaded;
  try {
    recordsSummariesLocalReloaded = await fetchRecords({
      survey,
      cycle,
      onlyLocal,
    });
  } catch (error) {
    throw new Error(`error fetching updated local records. Details: ${error}`);
  }

  return recordsSummariesLocalReloaded.map((recordSummaryLocal: any) => {
    const localKeyValues = RecordSummaries.getKeyValuesFormatted({
      survey,
      recordSummary: recordSummaryLocal,
    });
    const recordSummaryRemote = recordsSummariesRemote.find((summary: any) => {
      const remoteKeyValues = RecordSummaries.getKeyValuesFormatted({
        survey,
        recordSummary: summary,
      });
      return (
        summary.uuid === recordSummaryLocal.uuid ||
        Objects.isEqual(remoteKeyValues, localKeyValues)
      );
    });
    const syncStatus = determineRecordSyncStatus({
      survey,
      recordSummaryLocal,
      recordSummaryRemote,
    });
    recordSummaryLocal.syncStatus = syncStatus;
    return recordSummaryLocal;
  });
};

const findRecordSummariesByKeys = async ({
  survey,
  cycle,
  keyValues,
  keyValuesFormatted
}: any) => {
  const recordSummariesForKeyValues =
    await RecordRepository.findRecordSummariesByKeys({
      survey,
      cycle,
      keyValues,
    });
  const recordSummariesForKeyValuesByUuid = ArrayUtils.indexByUuid(
    recordSummariesForKeyValues
  );
  // try to fetch records using formatted keys
  const recordSummariesForKeyValuesFormatted =
    await RecordRepository.findRecordSummariesByKeys({
      survey,
      cycle,
      keyValues: keyValuesFormatted,
    });
  const recordSummaries = [...recordSummariesForKeyValues];
  recordSummariesForKeyValuesFormatted.forEach((recordSummary: any) => {
    if (!recordSummariesForKeyValuesByUuid[recordSummary.uuid]) {
      recordSummaries.push(recordSummary);
    }
  });
  return recordSummaries;
};

const findRecordSummariesWithSameKeys = async ({
  survey,
  record,
  lang,
  cycle: cycleParam = null
}: any) => {
  const cycle = cycleParam ?? Records.getCycle(record);
  const rootEntity = Records.getRoot(record);
  const keyValues = Records.getEntityKeyValues({
    survey,
    record,
    cycle,
    // @ts-expect-error TS(2322): Type 'Node | undefined' is not assignable to type ... Remove this comment to see the full error message
    entity: rootEntity,
  });
  const keyValuesFormatted = RecordNodes.getRootEntityKeysFormatted({
    survey,
    record,
    lang,
    showLabel: false,
  });
  return findRecordSummariesByKeys({
    survey,
    cycle,
    keyValues,
    keyValuesFormatted,
  });
};

const cloneRecordsIntoDefaultCycle = async ({
  survey,
  recordSummaries
}: any) => {
  const surveyId = survey.id;
  const defaultCycle = Surveys.getDefaultCycleKey(survey);

  for await (const recordSummary of recordSummaries) {
    const { id: recordId } = recordSummary;
    const record = await RecordRepository.fetchRecord({
      survey,
      recordId,
      includeContent: true,
    });
    const { record: recordCloned, newFileUuidsByOldUuid } =
      RecordCloner.cloneRecord({
        survey,
        record,
        // @ts-expect-error TS(2322): Type 'string | undefined' is not assignable to typ... Remove this comment to see the full error message
        cycleTo: defaultCycle,
        sideEffect: true,
      });
    await RecordRepository.insertRecord({ survey, record: recordCloned });

    // clone files
    for await (const [oldFileUuid, fileUuid] of Object.entries(
      newFileUuidsByOldUuid
    )) {
      const sourceFileUri = RecordFileService.getRecordFileUri({
        surveyId,
        fileUuid: oldFileUuid,
      });
      await RecordFileService.saveRecordFile({
        surveyId,
        fileUuid,
        sourceFileUri,
      });
    }
  }
};

export const RecordService = {
  fetchRecord,
  fetchRecordSummary,
  fetchRecords,
  syncRecordSummaries,
  fetchRecordsWithEmptyCycle,
  findRecordSummariesByKeys,
  findRecordSummariesWithSameKeys,
  insertRecord,
  updateRecord,
  updateRecordWithContentFetchedRemotely,
  updateRecordsDateSync,
  updateRecordsMergedInto,
  deleteRecords,
  fixRecordCycle,
  cloneRecordsIntoDefaultCycle,
  // remote server
  startExportRecordsFromRemoteServer,
  downloadExportedRecordsFileFromRemoteServer,
  uploadRecordsToRemoteServer,
};
