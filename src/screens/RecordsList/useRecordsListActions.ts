import { useCallback } from "react";
import { useNavigator } from "navigation/navigator";
import * as DocumentPicker from "expo-document-picker";

import { useToast } from "hooks";
import { RecordLoadStatus, RecordOrigin, RecordSyncStatus } from "model";
import { DataEntryActions, useAppDispatch, useConfirm } from "state";
import { Files } from "utils";

import { dataImportOptions, importFileExtension } from "./recordsListUtils";

type UseRecordsListActionsParams = {
  confirm: ReturnType<typeof useConfirm>;
  dispatch: ReturnType<typeof useAppDispatch>;
  loadRecords: () => Promise<void>;
  navigator: ReturnType<typeof useNavigator>;
  records: any[];
  setLoading: (loading: boolean) => void;
  toaster: ReturnType<typeof useToast>;
};

export const useRecordsListActions = ({
  confirm,
  dispatch,
  loadRecords,
  navigator,
  records,
  setLoading,
  toaster,
}: UseRecordsListActionsParams) => {
  const onImportRecordsFromFilePress = useCallback(async () => {
    const fileResult = await DocumentPicker.getDocumentAsync();
    const { assets, canceled } = fileResult;
    if (canceled) return;

    const asset = assets?.[0];
    if (!asset) return;

    const { name: fileName, uri } = asset;

    const messagePrefix = "recordsList:importRecordsFromFile.";

    if (Files.getExtension(fileName) !== importFileExtension) {
      toaster(`${messagePrefix}invalidFileType`);
      return;
    }

    const confirmResult = await confirm({
      titleKey: `${messagePrefix}title`,
      messageKey: `${messagePrefix}confirmMessage`,
      messageParams: { fileName },
      confirmButtonTextKey: `${messagePrefix}title`,
      multipleChoiceOptions: [
        {
          value: dataImportOptions.overwriteExistingRecords,
          label: `${messagePrefix}overwriteExistingRecords`,
        },
      ],
    });
    if (confirmResult) {
      const { selectedMultipleChoiceValues = [] } = confirmResult;
      const overwriteExistingRecords = selectedMultipleChoiceValues.includes(
        dataImportOptions.overwriteExistingRecords,
      );

      dispatch(
        DataEntryActions.importRecordsFromFile({
          fileUri: uri,
          overwriteExistingRecords,
          onImportComplete: loadRecords,
        }),
      );
    }
  }, [confirm, dispatch, loadRecords, toaster]);

  const onNewRecordPress = useCallback(async () => {
    setLoading(true);
    try {
      await dispatch(DataEntryActions.createNewRecord({ navigator }));
    } finally {
      setLoading(false);
    }
  }, [dispatch, navigator, setLoading]);

  const onDeleteSelectedRecordUuids = useCallback(
    async (recordUuids: any) => {
      if (
        await confirm({
          titleKey: "recordsList:deleteRecordsConfirm.title",
          messageKey: "recordsList:deleteRecordsConfirm.message",
          swipeToConfirm: true,
        })
      ) {
        await dispatch(DataEntryActions.deleteRecords(recordUuids));
        await loadRecords();
        return true;
      }
      return false;
    },
    [confirm, dispatch, loadRecords],
  );

  const checkRecordsCanBeImported = useCallback(
    (selectedRecords: any) => {
      const selectedLocalRecords = selectedRecords.filter(
        (record: any) => record.origin === RecordOrigin.local,
      );
      if (
        selectedLocalRecords.some(
          (record: any) =>
            record.syncStatus !== RecordSyncStatus.modifiedRemotely,
        )
      ) {
        toaster("dataEntry:dataExport.onlyRecordsInRemoteServerCanBeImported");
        return false;
      }
      return true;
    },
    [toaster],
  );

  const onFetchSelectedRecordUuids = useCallback(
    (selectedRecordUuids: any) => {
      const selectedRecords = records.filter((record) =>
        selectedRecordUuids.includes(record.uuid),
      );
      if (!checkRecordsCanBeImported(selectedRecords)) {
        return;
      }
      dispatch(
        DataEntryActions.fetchRecordsFromServer({
          recordUuids: selectedRecordUuids,
          onImportComplete: loadRecords,
        }),
      );
    },
    [checkRecordsCanBeImported, dispatch, loadRecords, records],
  );

  const checkRecordsCanBeCloned = useCallback(
    (selectedRecords: any) => {
      const selectedRemoteRecords = selectedRecords.filter(
        (record: any) => record.origin === RecordOrigin.remote,
      );
      if (
        selectedRemoteRecords.some(
          (record: any) => record.loadStatus !== RecordLoadStatus.complete,
        )
      ) {
        toaster(
          "recordsList:cloneRecords.onlyRecordsImportedInDeviceOrModifiedLocallyCanBeCloned",
        );
        return false;
      }
      return true;
    },
    [toaster],
  );

  const onCloneSelectedRecordUuids = useCallback(
    (selectedRecordUuids: any) => {
      const selectedRecords = records.filter((record) =>
        selectedRecordUuids.includes(record.uuid),
      );
      if (!checkRecordsCanBeCloned(selectedRecords)) {
        return;
      }
      dispatch(
        DataEntryActions.cloneRecordsIntoDefaultCycle({
          recordSummaries: selectedRecords,
          callback: loadRecords,
        }),
      );
    },
    [checkRecordsCanBeCloned, dispatch, loadRecords, records],
  );

  const onRevalidateSelectedRecordUuids = useCallback(
    (selectedRecordUuids: any) => {
      const recordIds = records
        .filter((record) => selectedRecordUuids.includes(record.uuid))
        .map((record) => record.id);
      dispatch(
        DataEntryActions.revalidateRecords({
          recordIds,
          callback: loadRecords,
        }),
      );
    },
    [dispatch, loadRecords, records],
  );

  const onRevalidateAllRecordsPress = useCallback(() => {
    dispatch(
      DataEntryActions.revalidateRecords({
        recordIds: records.map((record) => record.id),
        callback: loadRecords,
      }),
    );
  }, [dispatch, loadRecords, records]);

  return {
    onCloneSelectedRecordUuids,
    onDeleteSelectedRecordUuids,
    onFetchSelectedRecordUuids,
    onImportRecordsFromFilePress,
    onNewRecordPress,
    onRevalidateAllRecordsPress,
    onRevalidateSelectedRecordUuids,
  };
};
