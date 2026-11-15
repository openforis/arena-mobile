import { RecordRepository } from "./repository/recordRepository";
import { RecordLocalService } from "./recordLocalService";
import { RecordSyncService } from "./recordSyncService";

export const RecordService = {
  determineRecordSyncStatus: RecordSyncService.determineRecordSyncStatus,
  fetchRecord: RecordRepository.fetchRecord,
  fetchNodeValuesByDefUuids: RecordRepository.fetchNodeValuesByDefUuids,
  fetchRecordSummary: RecordRepository.fetchRecordSummary,
  fetchRecords: RecordRepository.fetchRecords,
  syncRecordSummaries: RecordSyncService.syncRecordSummaries,
  fetchRecordsWithEmptyCycle: RecordRepository.fetchRecordsWithEmptyCycle,
  findRecordSummariesByKeys: RecordLocalService.findRecordSummariesByKeys,
  findRecordSummariesWithSameKeys:
    RecordLocalService.findRecordSummariesWithSameKeys,
  insertRecord: RecordRepository.insertRecord,
  updateRecord: RecordRepository.updateRecord,
  updateRecordWithContentFetchedRemotely:
    RecordRepository.updateRecordWithContentFetchedRemotely,
  updateRecordWithContentMergedFromRemote:
    RecordRepository.updateRecordWithContentMergedFromRemote,
  updateRecordsDateSync: RecordRepository.updateRecordsDateSync,
  updateRecordsDateModifiedRemote:
    RecordRepository.updateRecordsDateModifiedRemote,
  fetchRecordsDateModifiedByUuid:
    RecordRepository.fetchRecordsDateModifiedByUuid,
  updateRecordsDateModifiedSynced:
    RecordRepository.updateRecordsDateModifiedSynced,
  confirmRecordsSyncedWithRemote:
    RecordSyncService.confirmRecordsSyncedWithRemote,
  updateRecordsMergedInto: RecordRepository.updateRecordsMergedInto,
  findFileUuidsInDevice: RecordLocalService.findFileUuidsInDevice,
  deleteRecords: RecordLocalService.deleteRecordsAndFiles,
  fixRecordCycle: RecordRepository.fixRecordCycle,
  cloneRecordsIntoDefaultCycle: RecordLocalService.cloneRecordsIntoDefaultCycle,
  revalidateRecords: RecordLocalService.revalidateRecords,
  // remote server
  startExportRecordsFromRemoteServer:
    RecordSyncService.startExportRecordsFromRemoteServer,
  downloadExportedRecordsFileFromRemoteServer:
    RecordSyncService.downloadExportedRecordsFileFromRemoteServer,
  uploadRecordsToRemoteServer: RecordSyncService.uploadRecordsToRemoteServer,
};
