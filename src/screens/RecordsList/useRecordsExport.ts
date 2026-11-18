import { useCallback, useMemo } from "react";

import { JobSerialized, Survey, Surveys } from "@openforis/arena-core";

import { useToast } from "hooks";
import { useTranslation } from "localization";
import { RecordUpdateConflictResolutionStrategy as ConflictResolutionStrategy } from "model";
import type { RecordsUploadResult } from "service/recordsUploadAndProcessJob";
import {
  AutoSyncSelectors,
  DataEntryActions,
  useAppDispatch,
  useConfirm,
} from "state";
import { OnConfirmParams } from "state/confirm";

import {
  conflictingRecordsExportOptions,
  generateRecordsCountSummaryText,
  noRecordsToExportTextKey,
} from "./recordsListUtils";
import {
  buildRecordsCountSummary,
  checkCanSendData,
  ExportRecord,
  filterRecordsByUuids,
  getLocalRecordUuids,
  groupRecordsForExport,
  hasMergeableConflicts,
  isNothingToExport,
  RecordsExportGroups,
  selectRecordsToExport,
} from "./recordsExportUtils";
import { RecordsListState } from "./useRecordsList";
import type { AppDispatch, AppGetState } from "state/store";

export type UseRecordsExportParams = {
  cycle: string | undefined;
  isDemoSurvey: boolean;
  loadRecordsWithSyncStatus: () => Promise<RecordsListState>;
  networkAvailable: boolean;
  records: ExportRecord[];
  setLoading: (loading: boolean) => void;
  survey: Survey | undefined;
  syncStatusFetched?: boolean;
};

type ConfirmExportResult = {
  groups?: RecordsExportGroups;
  confirmResult: OnConfirmParams | boolean | null;
};

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
    () =>
      dispatch((_dispatch: AppDispatch, getState: AppGetState) =>
        AutoSyncSelectors.selectAutoSyncRunning(getState()),
      ),
    [dispatch],
  );

  const confirmExportRecords = useCallback(
    async (records: ExportRecord[]): Promise<ConfirmExportResult> => {
      const groups = groupRecordsForExport(records);
      if (isNothingToExport(groups)) {
        toaster(noRecordsToExportTextKey);
        return { confirmResult: false };
      }
      const mergeWithSameKeysAllowed =
        !!survey && Surveys.isRecordsMergeWithSameKeysAllowed(survey);
      const confirmSingleChoiceOptions = hasMergeableConflicts({
        groups,
        mergeWithSameKeysAllowed,
      })
        ? conflictingRecordsExportOptions
        : [];

      const recordsCountSummary = buildRecordsCountSummary({ groups, records });
      const recordsCountSummaryText = [
        generateRecordsCountSummaryText({ recordsCountSummary, t }),
        ...(groups.conflictingRecords.length > 0 && !mergeWithSameKeysAllowed
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
      return { groups, confirmResult };
    },
    [confirm, survey, t, toaster],
  );

  // merging records edited on both this device and the server can silently pick one side's edit
  // over the other's per field, so ask for an extra explicit confirmation before proceeding
  const confirmMergeSameRecordConflicts = useCallback(
    async (count: number) =>
      !!(await confirm({
        titleKey: "dataEntry:dataExport.mergeSameRecordConflictConfirm.title",
        messageKey:
          "dataEntry:dataExport.mergeSameRecordConflictConfirm.message",
        messageParams: { count },
        swipeToConfirm: true,
      })),
    [confirm],
  );

  const exportSelectedRecords = useCallback(
    async ({
      selectedRecords,
      onlyRemote = false,
    }: {
      selectedRecords: ExportRecord[];
      onlyRemote?: boolean;
    }) => {
      if (isAutoSyncRunningNow()) {
        toaster("dataEntry:autoSync.syncInProgressToast");
        return;
      }
      const { groups, confirmResult } =
        await confirmExportRecords(selectedRecords);
      if (!confirmResult || !groups || !survey || !cycle) return;

      const mergeSelected =
        (confirmResult as OnConfirmParams).selectedSingleChoiceValue ===
        ConflictResolutionStrategy.merge;
      const { recordUuids, conflictResolutionStrategy } = selectRecordsToExport(
        {
          groups,
          mergeSelected,
          mergeWithSameKeysAllowed:
            Surveys.isRecordsMergeWithSameKeysAllowed(survey),
        },
      );
      if (recordUuids.length === 0) {
        toaster(noRecordsToExportTextKey);
        return;
      }
      const sameRecordConflictsCount = groups.sameRecordConflicts.length;
      if (
        mergeSelected &&
        sameRecordConflictsCount > 0 &&
        !(await confirmMergeSameRecordConflicts(sameRecordConflictsCount))
      ) {
        return;
      }

      setLoading(true);

      const onJobComplete = async (
        jobCompleted: JobSerialized<RecordsUploadResult | undefined>,
      ) => {
        const missingFiles = jobCompleted.result?.missingFiles ?? 0;

        await loadRecordsWithSyncStatus();

        if (missingFiles > 0) {
          toaster("dataEntry:dataExport.exportedSuccessfullyButFilesMissing", {
            missingFiles,
          });
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
    },
    [
      isAutoSyncRunningNow,
      confirmExportRecords,
      confirmMergeSameRecordConflicts,
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
    const recordUuids = getLocalRecordUuids(records);
    if (recordUuids.length === 0 || !cycle) {
      toaster(noRecordsToExportTextKey);
      return;
    }
    setLoading(true);
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
    async (recordUuids: string[]) => {
      const selectedRecords = records.filter((record) =>
        recordUuids.includes(record.uuid),
      );
      await exportSelectedRecords({ selectedRecords });
    },
    [exportSelectedRecords, records],
  );

  const onSendDataPress = useCallback(
    async (selectedRecordUuids?: string[]) => {
      const errorKey = checkCanSendData({
        survey,
        records,
        selectedRecordUuids,
      });
      if (errorKey) {
        toaster("recordsList:sendData.error.generic", {
          details: t(errorKey),
        });
        return;
      }
      const { syncStatusFetched: syncStatusFetchedNext, records: recordsNext } =
        await loadRecordsWithSyncStatus();
      if (syncStatusFetchedNext) {
        await exportSelectedRecords({
          selectedRecords: filterRecordsByUuids(
            recordsNext,
            selectedRecordUuids,
          ),
          onlyRemote: true,
        });
      }
    },
    [
      exportSelectedRecords,
      loadRecordsWithSyncStatus,
      records,
      survey,
      t,
      toaster,
    ],
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
