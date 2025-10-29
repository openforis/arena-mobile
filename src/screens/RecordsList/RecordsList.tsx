import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import * as DocumentPicker from "expo-document-picker";

import { Dates, Objects, Surveys } from "@openforis/arena-core";

import {
  Button,
  HView,
  Loader,
  MenuButton,
  Searchbar,
  Text,
  VView,
} from "components";
import { useIsNetworkConnected, useNavigationFocus, useToast } from "hooks";
import { useTranslation } from "localization";
import {
  RecordOrigin,
  RecordSyncStatus,
  RecordUpdateConflictResolutionStrategy as ConflictResolutionStrategy,
  RecordLoadStatus,
} from "model";
import { RecordService } from "service";
import {
  DataEntryActions,
  MessageActions,
  SurveySelectors,
  useAppDispatch,
  useConfirm,
} from "state";
import { RemoteConnectionUtils } from "state/remoteConnection/remoteConnectionUtils";
import { Files } from "utils";

import { RecordsDataVisualizer } from "./RecordsDataVisualizer";
import { RecordsUtils } from "./RecordsUtils";
import { RecordsListOptions } from "./RecordsListOptions";

import styles from "./styles";
import { RecordsListLegend } from "./RecordsListLegend";
import { ConfirmResult } from "state/confirm/utils";

const { checkLoggedInUser } = RemoteConnectionUtils;

const minRecordsToShowSearchBar = 5;
const noRecordsToExportTextKey =
  "dataEntry:dataExport.noRecordsInDeviceToExport";

const dataImportOptions = {
  overwriteExistingRecords: "overwriteExistingRecords",
};

const importFileExtension = "zip";

const conflictingRecordsExportOptions = [
  {
    value: ConflictResolutionStrategy.overwriteIfUpdated,
    label: "dataEntry:dataExport.onlyNewOrUpdatedRecords",
  },
  {
    value: ConflictResolutionStrategy.merge,
    label: "dataEntry:dataExport.mergeConflictingRecords",
  },
];

const generateRecordsCountSummaryText = ({
  recordsCountSummary,
  t,
}: {
  recordsCountSummary: Record<string, number>;
  t: any;
}) =>
  Object.entries(recordsCountSummary)
    .filter(([_key, value]) => value > 0) // exclude items with 0 count
    .map(([key, value]) => {
      const statusText = t(`dataEntry:recordStatus.${key}`);
      return `${value}: ${statusText}`;
    })
    .join("\n");

type RecordListState = {
  loading: boolean;
  onlyLocal?: boolean;
  records: any[];
  searchValue?: string;
  syncStatusLoading: boolean;
  syncStatusFetched?: boolean;
};

export const RecordsList = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const networkAvailable = useIsNetworkConnected();
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();
  const survey = SurveySelectors.useCurrentSurvey();
  const cycle = SurveySelectors.useCurrentSurveyCycle();
  const toaster = useToast();
  const confirm = useConfirm();

  const defaultCycleKey = survey ? Surveys.getDefaultCycleKey(survey) : null;

  const [state, setState] = useState({
    loading: true,
    onlyLocal: true,
    records: [],
    searchValue: "",
    syncStatusLoading: false,
    syncStatusFetched: false,
  } as RecordListState);
  const {
    loading,
    onlyLocal,
    records,
    searchValue,
    syncStatusLoading,
    syncStatusFetched,
  } = state;

  const loadRecords = useCallback(async () => {
    setState((statePrev) => ({
      ...statePrev,
      loading: true,
      searchValue: "",
      syncStatusFetched: false,
      syncStatusLoading: false,
    }));

    try {
      const _records = await RecordService.fetchRecords({
        survey,
        cycle,
        onlyLocal,
      });

      setState((statePrev) => ({
        ...statePrev,
        records: _records,
        loading: false,
      }));
    } catch (error) {
      setState((statePrev) => ({ ...statePrev, records: [], loading: false }));
      toaster("dataEntry:errorLoadingRecords", { details: String(error) });
    }
  }, [survey, cycle, onlyLocal, toaster]);

  // refresh records list on cycle and "only local" change
  useEffect(() => {
    loadRecords();
  }, [cycle, loadRecords, onlyLocal]);

  // refresh records list on navigation focus (e.g. going back to records list screen)
  useNavigationFocus(loadRecords);

  const loadRecordsWithSyncStatus =
    useCallback(async (): Promise<RecordListState> => {
      setState((statePrev) => ({
        ...statePrev,
        syncStatusLoading: true,
        syncStatusFetched: false,
      }));
      const stateNext = {
        records,
        loading: false,
        syncStatusLoading: false,
      };
      try {
        if (await checkLoggedInUser({ dispatch, navigation })) {
          const _records = await RecordService.syncRecordSummaries({
            survey,
            cycle,
            onlyLocal,
          });
          Object.assign(stateNext, {
            loading: false,
            records: _records,
            syncStatusFetched: true,
          });
        }
      } catch (error) {
        dispatch(
          MessageActions.setMessage({
            content: "dataEntry:errorFetchingRecordsSyncStatus",
            contentParams: { details: String(error) },
          })
        );
      }
      setState((statePrev) => ({ ...statePrev, ...stateNext }));
      return stateNext;
    }, [dispatch, navigation, survey, cycle, records, onlyLocal]);

  const onOnlyLocalChange = useCallback(
    (onlyLocalUpdated: any) =>
      setState((statePrev) => ({ ...statePrev, onlyLocal: onlyLocalUpdated })),
    []
  );

  const onSearchValueChange = useCallback(
    (searchValueUpdated: any) =>
      setState((statePrev) => ({
        ...statePrev,
        searchValue: searchValueUpdated,
      })),
    []
  );

  const onRemoteSyncPress = useCallback(async () => {
    await loadRecordsWithSyncStatus();
  }, [loadRecordsWithSyncStatus]);

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
      const { selectedMultipleChoiceValues } = confirmResult;
      const overwriteExistingRecords = selectedMultipleChoiceValues.includes(
        dataImportOptions.overwriteExistingRecords
      );

      dispatch(
        DataEntryActions.importRecordsFromFile({
          fileUri: uri,
          overwriteExistingRecords,
          onImportComplete: loadRecords,
        })
      );
    }
  }, [confirm, dispatch, loadRecords, toaster]);

  const onNewRecordPress = useCallback(() => {
    setState((statePrev) => ({ ...statePrev, loading: true }));
    dispatch(DataEntryActions.createNewRecord({ navigation }));
  }, [dispatch, navigation]);

  const confirmExportRecords = useCallback(
    async ({
      records,
    }: any): Promise<{
      newRecords?: any[];
      updatedRecords?: any[];
      conflictingRecords?: any[];
      confirmResult: ConfirmResult | boolean | null;
    }> => {
      const getRecordsByStatus = (status: any) =>
        records.filter((r: any) => r.syncStatus === status);
      const newRecords = getRecordsByStatus(RecordSyncStatus.new);
      const newRecordsCount = newRecords.length;

      const updatedRecords = getRecordsByStatus(
        RecordSyncStatus.modifiedLocally
      );
      const updatedRecordsCount = updatedRecords.length;

      const conflictingRecords = getRecordsByStatus(
        RecordSyncStatus.conflictingKeys
      );
      const conflictingRecordsCount = conflictingRecords.length;

      if (
        newRecordsCount + updatedRecordsCount + conflictingRecordsCount ===
        0
      ) {
        toaster(noRecordsToExportTextKey);
        return { confirmResult: false };
      }
      const confirmSingleChoiceOptions =
        conflictingRecordsCount > 0 ? conflictingRecordsExportOptions : [];

      const recordsWithErrorsCount = records.filter(
        (r: any) => r.errors > 0
      ).length;

      const recordsCountSummary = {
        new: newRecordsCount,
        updated: updatedRecordsCount,
        conflicting: conflictingRecordsCount,
        withValidationErrors: recordsWithErrorsCount,
      };
      const recordsCountSummaryText = generateRecordsCountSummaryText({
        recordsCountSummary,
        t,
      });
      const confirmResult = await confirm({
        titleKey: "dataEntry:dataExport.confirm.title",
        messageKey: "dataEntry:dataExport.confirm.message",
        messageParams: { recordsCountSummary: recordsCountSummaryText },
        confirmButtonTextKey: "dataEntry:dataExport.title",
        singleChoiceOptions: confirmSingleChoiceOptions,
        defaultSingleChoiceValue: confirmSingleChoiceOptions[0]?.value,
      });
      return { newRecords, updatedRecords, conflictingRecords, confirmResult };
    },
    [confirm, t, toaster]
  );

  const exportSelectedRecords = useCallback(
    async ({ selectedRecords, onlyRemote = false }: any) => {
      const { newRecords, updatedRecords, conflictingRecords, confirmResult } =
        await confirmExportRecords({ records: selectedRecords });
      if (confirmResult) {
        const recordsToExport = [...newRecords!, ...updatedRecords!];

        let conflictResolutionStrategy =
          ConflictResolutionStrategy.overwriteIfUpdated;
        if (
          (confirmResult as ConfirmResult).selectedSingleChoiceValue ===
          ConflictResolutionStrategy.merge
        ) {
          recordsToExport.push(...conflictingRecords!);
          conflictResolutionStrategy = ConflictResolutionStrategy.merge;
        }
        const recordUuids = recordsToExport.map((r) => r.uuid);
        if (recordUuids.length === 0) {
          toaster(noRecordsToExportTextKey);
          return;
        }
        setState((statePrev) => ({ ...statePrev, loading: true }));

        const onJobComplete = async (jobCompleted: any) => {
          const { result } = jobCompleted;
          const { missingFiles } = result;

          await loadRecordsWithSyncStatus();

          if (missingFiles > 0) {
            toaster(
              "dataEntry:dataExport.exportedSuccessfullyButFilesMissing",
              { missingFiles }
            );
          }
        };
        dispatch(
          DataEntryActions.exportRecords({
            cycle,
            recordUuids,
            conflictResolutionStrategy,
            onJobComplete,
            onEnd: () =>
              setState((statePrev) => ({ ...statePrev, loading: false })),
            onlyRemote,
          })
        );
      }
    },
    [confirmExportRecords, cycle, dispatch, loadRecordsWithSyncStatus, toaster]
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
        onEnd: () => {
          setState((statePrev) => ({ ...statePrev, loading: false }));
        },
      })
    );
  }, [cycle, dispatch, records, toaster]);

  const onExportSelectedRecordUuids = useCallback(
    async (recordUuids: any) => {
      const selectedRecords = records!.filter((record) =>
        recordUuids.includes(record.uuid)
      );
      await exportSelectedRecords({ selectedRecords });
    },
    [exportSelectedRecords, records]
  );

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
      }
    },
    [confirm, dispatch, loadRecords]
  );

  const checkRecordsCanBeImported = useCallback(
    (selectedRecords: any) => {
      const selectedLocalRecords = selectedRecords.filter(
        (record: any) => record.origin === RecordOrigin.local
      );
      if (
        selectedLocalRecords.some((record: any) => {
          const { dateModified, dateModifiedRemote, dateSynced } = record;
          return (
            !dateSynced || !Dates.isAfter(dateModifiedRemote, dateModified)
          );
        })
      ) {
        toaster("dataEntry:dataExport.onlyRecordsInRemoteServerCanBeImported");
        return false;
      }
      return true;
    },
    [toaster]
  );

  const onImportSelectedRecordUuids = useCallback(
    (selectedRecordUuids: any) => {
      const selectedRecords = records.filter((record) =>
        selectedRecordUuids.includes(record.uuid)
      );
      if (!checkRecordsCanBeImported(selectedRecords)) {
        return;
      }
      dispatch(
        DataEntryActions.importRecordsFromServer({
          recordUuids: selectedRecordUuids,
          onImportComplete: loadRecords,
        })
      );
    },
    [checkRecordsCanBeImported, dispatch, loadRecords, records]
  );

  const checkRecordsCanBeCloned = useCallback(
    (selectedRecords: any) => {
      const selectedRemoteRecords = selectedRecords.filter(
        (record: any) => record.origin === RecordOrigin.remote
      );
      if (
        selectedRemoteRecords.some(
          (record: any) => record.loadStatus !== RecordLoadStatus.complete
        )
      ) {
        toaster(
          "recordsList:cloneRecords.onlyRecordsImportedInDeviceOrModifiedLocallyCanBeCloned"
        );
        return false;
      }
      return true;
    },
    [toaster]
  );

  const onCloneSelectedRecordUuids = useCallback(
    (selectedRecordUuids: any) => {
      const selectedRecords = records.filter((record) =>
        selectedRecordUuids.includes(record.uuid)
      );
      if (!checkRecordsCanBeCloned(selectedRecords)) {
        return;
      }
      dispatch(
        DataEntryActions.cloneRecordsIntoDefaultCycle({
          recordSummaries: selectedRecords,
          callback: loadRecords,
        })
      );
    },
    [checkRecordsCanBeCloned, dispatch, loadRecords, records]
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

  const onSendDataPress = useCallback(async () => {
    const { errorKey } = checkCanSendData();
    if (errorKey) {
      toaster("recordsList:sendData.error.generic", { details: t(errorKey) });
    } else {
      const { syncStatusFetched: syncStatusFetchedNext, records: recordsNext } =
        await loadRecordsWithSyncStatus();
      if (syncStatusFetchedNext) {
        await exportSelectedRecords({
          selectedRecords: recordsNext,
          onlyRemote: true,
        });
      }
    }
  }, [
    checkCanSendData,
    exportSelectedRecords,
    loadRecordsWithSyncStatus,
    t,
    toaster,
  ]);

  const recordsFiltered = useMemo(() => {
    if (Objects.isEmpty(searchValue)) return records;

    return records.filter((recordSummary) => {
      const valuesByKey = RecordsUtils.getValuesByKeyFormatted({
        survey,
        lang,
        recordSummary,
        t,
      });
      const searchValueLowerCase = searchValue?.toLocaleLowerCase() ?? "";
      return Object.values(valuesByKey).some(
        (value) =>
          !Objects.isEmpty(value) &&
          String(value).toLocaleLowerCase().includes(searchValueLowerCase)
      );
    });
  }, [searchValue, records, survey, lang, t]);

  const newRecordButton = useMemo(
    () =>
      defaultCycleKey === cycle ? (
        <Button
          icon="plus"
          onPress={onNewRecordPress}
          style={styles.newRecordButton}
          labelVariant="bodyLarge"
          textKey="dataEntry:newRecord"
        />
      ) : null,
    [cycle, defaultCycleKey, onNewRecordPress]
  );

  const downloadMenuItems = useMemo(() => {
    const items = [];
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
    items.push(
      {
        key: "exportNewOrUpdatedRecords",
        icon: "upload",
        label: "dataEntry:exportNewOrUpdatedRecords",
        disabled: !syncStatusFetched,
        onPress: onExportNewOrUpdatedRecordsPress,
      },
      {
        key: "exportAllRecords",
        icon: "download",
        label: "dataEntry:localBackup",
        onPress: onExportAllRecordsPress,
      }
    );
    return items;
  }, [
    networkAvailable,
    syncStatusFetched,
    loadRecordsWithSyncStatus,
    onExportAllRecordsPress,
    onExportNewOrUpdatedRecordsPress,
  ]);

  const recordsLength = records?.length ?? 0;

  return (
    <VView style={styles.container}>
      <VView style={styles.innerContainer}>
        <RecordsListOptions
          onImportRecordsFromFilePress={onImportRecordsFromFilePress}
          onlyLocal={onlyLocal}
          onOnlyLocalChange={onOnlyLocalChange}
          onRemoteSyncPress={onRemoteSyncPress}
          syncStatusLoading={syncStatusLoading}
        />
        {loading ? (
          <Loader />
        ) : (
          <>
            {recordsLength > minRecordsToShowSearchBar && (
              <Searchbar value={searchValue} onChange={onSearchValueChange} />
            )}
            {recordsLength === 0 && (
              <>
                <Text
                  textKey="dataEntry:noRecordsFound"
                  variant="titleMedium"
                />
                {newRecordButton}
              </>
            )}
            {recordsLength > 0 && (
              <RecordsDataVisualizer
                onCloneSelectedRecordUuids={onCloneSelectedRecordUuids}
                onDeleteSelectedRecordUuids={onDeleteSelectedRecordUuids}
                onExportSelectedRecordUuids={onExportSelectedRecordUuids}
                onImportSelectedRecordUuids={onImportSelectedRecordUuids}
                records={recordsFiltered}
                showRemoteProps={!onlyLocal}
                syncStatusFetched={syncStatusFetched}
                syncStatusLoading={syncStatusLoading}
              />
            )}
          </>
        )}
      </VView>
      {syncStatusFetched && <RecordsListLegend />}
      {recordsLength > 0 && (
        <HView style={styles.bottomActionBar}>
          {newRecordButton}
          <Button
            icon="cloud-refresh"
            onPress={onSendDataPress}
            textKey="dataEntry:sendData"
          />
          <MenuButton
            icon="download"
            items={downloadMenuItems}
            style={styles.exportDataMenuButton}
          />
        </HView>
      )}
    </VView>
  );
};
