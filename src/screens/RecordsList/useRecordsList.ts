import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import * as DocumentPicker from "expo-document-picker";

import { Objects, Surveys } from "@openforis/arena-core";

import { useIsNetworkConnected, useNavigationFocus, useToast } from "hooks";
import { useTranslation } from "localization";
import {
  RecordUtils,
  RecordOrigin,
  RecordSyncStatus,
  RecordLoadStatus,
} from "model";
import { RecordService, SurveyService } from "service";
import {
  DataEntryActions,
  MessageActions,
  SurveySelectors,
  useAppDispatch,
  useConfirm,
} from "state";
import { RemoteConnectionUtils } from "state/remoteConnection/remoteConnectionUtils";
import { Files } from "utils";

import { dataImportOptions, importFileExtension } from "./recordsListUtils";

export type RecordsListState = {
  loading: boolean;
  onlyLocal: boolean;
  records: any[];
  searchValue: string;
  syncStatusLoading: boolean;
  syncStatusFetched: boolean;
};

const initialState: RecordsListState = {
  loading: true,
  onlyLocal: true,
  records: [],
  searchValue: "",
  syncStatusLoading: false,
  syncStatusFetched: false,
};

export const useRecordsList = () => {
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
  const isDemoSurvey = survey?.uuid === SurveyService.demoSurveyUuid;

  const [state, setState] = useState<RecordsListState>(initialState);
  const {
    loading,
    onlyLocal,
    records,
    searchValue,
    syncStatusLoading,
    syncStatusFetched,
  } = state;

  const setLoading = useCallback(
    (loadingUpdated: boolean) =>
      setState((statePrev) => ({ ...statePrev, loading: loadingUpdated })),
    [],
  );

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
    useCallback(async (): Promise<RecordsListState> => {
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
        if (await RemoteConnectionUtils.checkLoggedInUser({ dispatch, navigation })) {
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
          }),
        );
      }
      setState((statePrev) => ({ ...statePrev, ...stateNext }));
      return stateNext as RecordsListState;
    }, [dispatch, navigation, survey, cycle, records, onlyLocal]);

  const onOnlyLocalChange = useCallback(
    (onlyLocalUpdated: boolean) =>
      setState((statePrev) => ({ ...statePrev, onlyLocal: onlyLocalUpdated })),
    [],
  );

  const onSearchValueChange = useCallback(
    (searchValueUpdated: string) =>
      setState((statePrev) => ({
        ...statePrev,
        searchValue: searchValueUpdated,
      })),
    [],
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
    await dispatch(DataEntryActions.createNewRecord({ navigation }));
    setLoading(false);
  }, [dispatch, navigation, setLoading]);

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

  const recordsFiltered = useMemo(() => {
    if (Objects.isEmpty(searchValue)) return records;

    return records.filter((recordSummary) => {
      const valuesByKey = RecordUtils.getRecordSummaryValuesByKeyFormatted({
        survey,
        lang,
        recordSummary,
        t,
      });
      const searchValueLowerCase = searchValue?.toLocaleLowerCase() ?? "";
      return Object.values(valuesByKey).some(
        (value) =>
          !Objects.isEmpty(value) &&
          String(value).toLocaleLowerCase().includes(searchValueLowerCase),
      );
    });
  }, [searchValue, records, survey, lang, t]);

  return {
    cycle,
    defaultCycleKey,
    isDemoSurvey,
    lang,
    loading,
    loadRecords,
    loadRecordsWithSyncStatus,
    networkAvailable,
    onCloneSelectedRecordUuids,
    onDeleteSelectedRecordUuids,
    onFetchSelectedRecordUuids,
    onImportRecordsFromFilePress,
    onlyLocal,
    onNewRecordPress,
    onOnlyLocalChange,
    onRemoteSyncPress,
    onSearchValueChange,
    records,
    recordsFiltered,
    searchValue,
    setLoading,
    survey,
    syncStatusFetched,
    syncStatusLoading,
  };
};
