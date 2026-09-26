import { useCallback, useMemo } from "react";

import { Surveys } from "@openforis/arena-core";

import { useToast } from "hooks";
import { useTranslation } from "localization";
import {
  RecordOrigin,
  RecordSyncStatus,
  RecordUpdateConflictResolutionStrategy as ConflictResolutionStrategy,
} from "model";
import { AutoSyncSelectors, DataEntryActions, useAppDispatch, useConfirm } from "state";
import { OnConfirmParams } from "state/confirm";

import {
  conflictingRecordsExportOptions,
  generateRecordsCountSummaryText,
  noRecordsToExportTextKey,
} from "./recordsListUtils";
import { RecordsListState } from "./useRecordsList";

export type UseRecordsExportParams = {
  cycle: any;
  isDemoSurvey: boolean;
  loadRecordsWithSyncStatus: () => Promise<RecordsListState>;
  networkAvailable: boolean;
  records: any[];
  setLoading: (loading: boolean) => void;
  survey: any;
  syncStatusFetched?: boolean;
};

const filterRecordsByUuids = (records: any[], recordUuids: string[] | undefined) =>
  recordUuids && recordUuids.length > 0
    ? records.filter((record) => recordUuids.includes(record.uuid)
    )
    : records;

export const useRecordsExport = ({
  cycle,
  isDemoSurvey,
  loadRecordsWithSyncStatus,
  networkAvailable,
  records,
  setLoading,
  survey,
  syncStatusFetched,
}: UseRecordsExportParams) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const toaster = useToast();
  const confirm = useConfirm();
  // reactive, for greying out UI (the download menu item below) - fine if a render behind
  const autoSyncRunning = AutoSyncSelectors.useAutoSyncRunning();
  // live re-check via getState(), for the actual guard right before starting a manual export:
  // a useCallback closure over the reactive value above can go stale mid-flight, e.g. when the
  // callback's own call to loadRecordsWithSyncStatus() is what flips "checking" on and off
  const isAutoSyncRunningNow = useCallback(
    () => dispatch((_dispatch: any, getState: any) => AutoSyncSelectors.selectAutoSyncRunning(getState())),
    [dispatch],
  );

  const confirmExportRecords = useCallback(
    async ({
      records,
    }: any): Promise<{
      newRecords?: any[];
      updatedRecords?: any[];
      conflictingRecords?: any[];
      sameRecordConflicts?: any[];
      confirmResult: OnConfirmParams | boolean | null;
    }> => {
      const getRecordsByStatus = (status: any) =>
        records.filter((r: any) => r.syncStatus === status);
      const newRecords = getRecordsByStatus(RecordSyncStatus.new);
      const newRecordsCount = newRecords.length;

      const updatedRecords = getRecordsByStatus(
        RecordSyncStatus.modifiedLocally,
      );
      const updatedRecordsCount = updatedRecords.length;

      const conflictingRecords = getRecordsByStatus(
        RecordSyncStatus.conflictingKeys,
      );
      const conflictingRecordsCount = conflictingRecords.length;
      // the survey may not allow merging records with the same key(s) (survey security option):
      // those records then can't be sent at all, the user has to change their key values first
      const mergeWithSameKeysAllowed =
        Surveys.isRecordsMergeWithSameKeysAllowed(survey);
      const mergeableConflictingRecordsCount = mergeWithSameKeysAllowed
        ? conflictingRecordsCount
        : 0;

      // records also modified on the server since this device last synced them: currently blocked from
      // export entirely unless the user opts into merging them with the server's changes.
      // modifiedLocallyAndRemotely means both sides actually diverged since the last known baseline
      // (a real risk of the merge silently dropping one side's edit); modifiedRemotely is kept here too
      // since, before a baseline is captured for a record, it's the only signal we have that the server moved.
      const sameRecordConflicts = records.filter((r: any) =>
        [
          RecordSyncStatus.modifiedRemotely,
          RecordSyncStatus.modifiedLocallyAndRemotely,
        ].includes(r.syncStatus),
      );
      const sameRecordConflictsCount = sameRecordConflicts.length;

      if (
        newRecordsCount +
        updatedRecordsCount +
        conflictingRecordsCount +
        sameRecordConflictsCount ===
        0
      ) {
        toaster(noRecordsToExportTextKey);
        return { confirmResult: false };
      }
      const confirmSingleChoiceOptions =
        mergeableConflictingRecordsCount + sameRecordConflictsCount > 0
          ? conflictingRecordsExportOptions
          : [];

      const recordsWithErrorsCount = records.filter(
        (r: any) => r.errors > 0,
      ).length;

      const recordsCountSummary = {
        new: newRecordsCount,
        updated: updatedRecordsCount,
        conflicting: conflictingRecordsCount,
        conflictingModifiedRemotely: sameRecordConflictsCount,
        withValidationErrors: recordsWithErrorsCount,
      };
      const recordsCountSummaryText = [
        generateRecordsCountSummaryText({ recordsCountSummary, t }),
        ...(conflictingRecordsCount > 0 && !mergeWithSameKeysAllowed
          ? ["", t("dataEntry:dataExport.mergeWithSameKeysNotAllowed")]
          : []),
      ].join("\n");
      const confirmResult = await confirm({
        titleKey: "dataEntry:dataExport.confirm.title",
        messageKey: "dataEntry:dataExport.confirm.message",
        messageParams: { recordsCountSummary: recordsCountSummaryText },
        confirmButtonTextKey: "dataEntry:dataExport.title",
        singleChoiceOptions: confirmSingleChoiceOptions,
        defaultSingleChoiceValue: confirmSingleChoiceOptions[0]?.value,
      });
      return {
        newRecords,
        updatedRecords,
        conflictingRecords,
        sameRecordConflicts,
        confirmResult,
      };
    },
    [confirm, survey, t, toaster],
  );

  const exportSelectedRecords = useCallback(
    async ({ selectedRecords, onlyRemote = false }: any) => {
      if (isAutoSyncRunningNow()) {
        toaster("dataEntry:autoSync.syncInProgressToast");
        return;
      }
      const {
        newRecords,
        updatedRecords,
        conflictingRecords,
        sameRecordConflicts,
        confirmResult,
      } = await confirmExportRecords({ records: selectedRecords });
      if (confirmResult) {
        const recordsToExport = [...newRecords!, ...updatedRecords!];

        let conflictResolutionStrategy =
          ConflictResolutionStrategy.overwriteIfUpdated;
        const mergeSelected =
          (confirmResult as OnConfirmParams).selectedSingleChoiceValue ===
          ConflictResolutionStrategy.merge;
        if (mergeSelected) {
          if (Surveys.isRecordsMergeWithSameKeysAllowed(survey)) {
            recordsToExport.push(...conflictingRecords!);
          }
          recordsToExport.push(...sameRecordConflicts!);
          conflictResolutionStrategy = ConflictResolutionStrategy.merge;
        }
        const recordUuids = recordsToExport.map((r) => r.uuid);
        if (recordUuids.length === 0) {
          toaster(noRecordsToExportTextKey);
          return;
        }

        // merging records edited on both this device and the server can silently pick one side's edit
        // over the other's per field, so ask for an extra explicit confirmation before proceeding
        if (mergeSelected && sameRecordConflicts!.length > 0) {
          const strongConfirmResult = await confirm({
            titleKey: "dataEntry:dataExport.mergeSameRecordConflictConfirm.title",
            messageKey:
              "dataEntry:dataExport.mergeSameRecordConflictConfirm.message",
            messageParams: { count: sameRecordConflicts!.length },
            swipeToConfirm: true,
          });
          if (!strongConfirmResult) {
            return;
          }
        }

        setLoading(true);

        const onJobComplete = async (jobCompleted: any) => {
          const { result } = jobCompleted;
          const { missingFiles } = result;

          await loadRecordsWithSyncStatus();

          if (missingFiles > 0) {
            toaster(
              "dataEntry:dataExport.exportedSuccessfullyButFilesMissing",
              { missingFiles },
            );
          }
        };
        dispatch(
          DataEntryActions.exportRecords({
            cycle,
            recordUuids,
            conflictResolutionStrategy,
            onJobComplete,
            onEnd: () => setLoading(false),
            onlyRemote,
          }),
        );
      }
    },
    [
      isAutoSyncRunningNow,
      confirm,
      confirmExportRecords,
      cycle,
      dispatch,
      loadRecordsWithSyncStatus,
      setLoading,
      survey,
      toaster,
    ],
  );

  const onExportNewOrUpdatedRecordsPress = useCallback(async () => {
    await exportSelectedRecords({ selectedRecords: records });
  }, [exportSelectedRecords, records]);

  const onExportAllRecordsPress = useCallback(() => {
    const recordUuids = records
      ?.filter((record) => record.origin === RecordOrigin.local)
      .map((record) => record.uuid);

    if (recordUuids?.length === 0) {
      toaster(noRecordsToExportTextKey);
      return;
    }
    dispatch(
      DataEntryActions.exportRecords({
        cycle,
        recordUuids,
        onlyLocally: true,
        onEnd: () => setLoading(false),
      }),
    );
  }, [cycle, dispatch, records, setLoading, toaster]);

  const onExportToCsvPress = useCallback(() => {
    dispatch(DataEntryActions.startCsvDataExportJob());
  }, [dispatch]);

  const onExportSelectedRecordUuids = useCallback(
    async (recordUuids: any) => {
      const selectedRecords = records!.filter((record) =>
        recordUuids.includes(record.uuid),
      );
      await exportSelectedRecords({ selectedRecords });
    },
    [exportSelectedRecords, records],
  );

  const checkCanSendData = useCallback(() => {
    if (!survey) {
      return {
        errorKey: "recordsList:sendData.error.surveyNotSelected",
      };
    }
    if (!Surveys.isVisibleInMobile(survey)) {
      return {
        errorKey: "recordsList:sendData.error.surveyNotVisibleInMobile",
      };
    } else if (!Surveys.isRecordsUploadFromMobileAllowed(survey)) {
      return { errorKey: "recordsList:sendData.error.recordsUploadNotAllowed" };
    } else if (
      (records.filter((r) => r.errors).length ?? 0) > 0 &&
      !Surveys.isRecordsWithErrorsUploadFromMobileAllowed(survey)
    ) {
      return {
        errorKey:
          "recordsList:sendData.error.recordsWithErrorsUploadNotAllowed",
      };
    }
    return {};
  }, [records, survey]);

  const onSendDataPress = useCallback(
    async (selectedRecordUuids?: string[]) => {
      const { errorKey } = checkCanSendData();
      if (errorKey) {
        toaster("recordsList:sendData.error.generic", {
          details: t(errorKey),
        });
      } else {
        const {
          syncStatusFetched: syncStatusFetchedNext,
          records: recordsNext,
        } = await loadRecordsWithSyncStatus();
        if (syncStatusFetchedNext) {
          const recordsToSend =
            filterRecordsByUuids(recordsNext, selectedRecordUuids);
          await exportSelectedRecords({
            selectedRecords: recordsToSend,
            onlyRemote: true,
          });
        }
      }
    },
    [checkCanSendData, exportSelectedRecords, loadRecordsWithSyncStatus, t, toaster],
  );

  const downloadMenuItems = useMemo(() => {
    const items = [];
    if (!isDemoSurvey) {
      if (networkAvailable) {
        items.push({
          key: "checkStatus",
          icon: "cloud-refresh",
          keepMenuOpenOnPress: true,
          label: "dataEntry:checkStatus",
          onPress: loadRecordsWithSyncStatus,
        });
      } else {
        items.push({
          key: "networkNotAvailable",
          keepMenuOpenOnPress: false,
          label: "common:networkNotAvailable",
          disabled: true,
        });
      }
    }
    items.push(
      {
        key: "exportNewOrUpdatedRecords",
        icon: "upload",
        label: "dataEntry:exportNewOrUpdatedRecords",
        disabled: !syncStatusFetched || autoSyncRunning,
        onPress: onExportNewOrUpdatedRecordsPress,
      },
      {
        key: "exportAllRecords",
        icon: "download",
        label: "dataEntry:localBackup",
        onPress: onExportAllRecordsPress,
      },
      {
        key: "exportToCsv",
        icon: "file-excel",
        label: "dataEntry:dataExport.exportToCsv",
        onPress: onExportToCsvPress,
      },
    );
    return items;
  }, [
    autoSyncRunning,
    isDemoSurvey,
    syncStatusFetched,
    onExportNewOrUpdatedRecordsPress,
    onExportAllRecordsPress,
    onExportToCsvPress,
    networkAvailable,
    loadRecordsWithSyncStatus,
  ]);

  return {
    downloadMenuItems,
    onExportSelectedRecordUuids,
    onSendDataPress,
  };
};


