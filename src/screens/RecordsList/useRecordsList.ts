import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { RecordService } from "service";
import {
  AutoSyncActions,
  AutoSyncSelectors,
  AutoSyncStatus,
  DataEntryActions,
  RemoteConnectionSelectors,
  SettingsSelectors,
  SurveySelectors,
  useAppDispatch,
  useConfirm,
  wasRecentlyCheckedWithNoNewLocalChanges,
} from "state";
import { isAuthError } from "state/autoSync";
import { useJobMonitor } from "state/jobMonitor/useJobMonitor";
import { RemoteConnectionUtils } from "state/remoteConnection/remoteConnectionUtils";
import { Files, log } from "utils";

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
  const isDemoSurvey = SurveySelectors.useIsCurrentSurveyDemo();

  const { autoSyncEnabled } = SettingsSelectors.useSettings();
  const loggedInUser = RemoteConnectionSelectors.useLoggedInUser();
  // the only job that runs silently in this app is the background auto-sync upload (see
  // actionsAutoSync.ts); used here just to know when to refresh this screen's own per-record
  // list after a tick uploads something - the shared aggregate status lives in the autoSync
  // redux slice instead (AutoSyncSelectors), so other screens don't need this at all
  const { isOpen: jobIsOpen, silent: jobIsSilent } = useJobMonitor();
  const autoSyncUploadRunning = jobIsOpen && jobIsSilent;

  const [state, setState] = useState<RecordsListState>(initialState);
  const {
    loading,
    onlyLocal,
    records,
    searchValue,
    syncStatusLoading,
    syncStatusFetched,
  } = state;
  // mirrors state.records without needing to be a useCallback dependency itself - see
  // loadRecordsWithSyncStatus below for why that matters
  const recordsRef = useRef(records);
  recordsRef.current = records;

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

  const loadRecordsWithSyncStatus =
    useCallback(async (): Promise<RecordsListState> => {
      log.debug(
        `loadRecordsWithSyncStatus: starting (survey=${survey?.uuid}, cycle=${cycle}, onlyLocal=${onlyLocal})`,
      );
      setState((statePrev) => ({
        ...statePrev,
        syncStatusLoading: true,
        syncStatusFetched: false,
      }));
      dispatch(AutoSyncActions.checkStart());
      // only set on success below; left out entirely on failure/abort, so the setState merge
      // further down falls back to whatever the current state's `records` already is, instead
      // of this callback needing its own `records` closure (which - being replaced with a new
      // array reference on every successful check - would otherwise make this callback's
      // identity, and so checkAutoSyncStatusIfNeeded's below, change on every successful check,
      // re-triggering the effects that call it and looping forever)
      const stateNext: Partial<RecordsListState> = {
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
          log.debug(
            `loadRecordsWithSyncStatus: fetched ${_records.length} record summary(ies)`,
          );
          dispatch(AutoSyncActions.checkEnd({ records: _records, survey }));
          Object.assign(stateNext, {
            records: _records,
            syncStatusFetched: true,
          });
        } else {
          log.debug("loadRecordsWithSyncStatus: user not logged in, aborting");
          dispatch(AutoSyncActions.checkAborted());
        }
      } catch (error) {
        // shown through the sync status icon (see AutoSyncActions.checkError) instead of a
        // blocking popup: a popup would otherwise reappear every time an automatic re-check is
        // triggered (screen focus, cycle change, ...) for as long as the underlying problem
        // (e.g. a server error) persists
        log.warn(`loadRecordsWithSyncStatus: error fetching records sync status: ${error}`);
        // same distinction as the background tick (see handleAutoSyncTickError): an expired
        // session gets its own "log in again" status instead of a generic server error
        dispatch(
          isAuthError(error) ? AutoSyncActions.authError() : AutoSyncActions.checkError(),
        );
      }
      setState((statePrev) => ({ ...statePrev, ...stateNext }));
      return {
        ...stateNext,
        records: stateNext.records ?? recordsRef.current,
      } as RecordsListState;
    }, [dispatch, navigation, survey, cycle, onlyLocal]);

  const {
    status: autoSyncStatus,
    lastCheckedAt: autoSyncLastCheckedAt,
    lastLocalChangeAt: autoSyncLastLocalChangeAt,
  } = AutoSyncSelectors.useAutoSyncState();

  // read via a ref (not a checkAutoSyncStatusIfNeeded dependency) so that callback's identity
  // stays stable across checks - lastCheckedAt changes every time loadRecordsWithSyncStatus
  // below completes one, so depending on it directly would recreate the callback, which would
  // re-trigger the effect that calls it (see below), which would complete another check,
  // forever: an infinite loop of "checking" that never settles
  const autoSyncThrottleStateRef = useRef({
    lastCheckedAt: autoSyncLastCheckedAt,
    lastLocalChangeAt: autoSyncLastLocalChangeAt,
  });
  autoSyncThrottleStateRef.current = {
    lastCheckedAt: autoSyncLastCheckedAt,
    lastLocalChangeAt: autoSyncLastLocalChangeAt,
  };

  // when auto sync is on, keep the sync status visible in the list without requiring the
  // user to press "check status" manually; skip it if auto-sync itself couldn't run anyway
  // (no network/no logged in user), to avoid popping the "connect to remote server" dialog.
  // Also skip it once a check has failed (AutoSyncActions.checkError/authError): from here on,
  // only an explicit "check status"/"send data" action (calling loadRecordsWithSyncStatus
  // directly, bypassing this) retries - see the sync status icon.
  const canCheckAutoSyncStatus =
    autoSyncEnabled &&
    networkAvailable &&
    !!loggedInUser &&
    !isDemoSurvey &&
    autoSyncStatus !== AutoSyncStatus.checkError &&
    autoSyncStatus !== AutoSyncStatus.authError;

  const checkAutoSyncStatusIfNeeded = useCallback(async () => {
    if (!canCheckAutoSyncStatus) return;

    // also attempt the actual sync (not just a status refresh) whenever the records list comes
    // into focus, instead of leaving pending records waiting for the next periodic background
    // tick (up to AUTO_SYNC_INTERVAL_MS away) - unless a check already ran very recently and
    // nothing local has changed since, e.g. the user quickly bouncing in and out of this screen.
    // Evaluated before the status refresh below, which itself updates lastCheckedAt
    const shouldRunAutoSync = !wasRecentlyCheckedWithNoNewLocalChanges(
      autoSyncThrottleStateRef.current,
    );

    const { records: fetchedRecords, syncStatusFetched: fetched } =
      await loadRecordsWithSyncStatus();

    // the tick reuses the summaries just fetched, instead of fetching them again concurrently
    if (shouldRunAutoSync && fetched) {
      dispatch(DataEntryActions.runAutoSync({ prefetchedRecords: fetchedRecords }));
    }
  }, [canCheckAutoSyncStatus, loadRecordsWithSyncStatus, dispatch]);

  useEffect(() => {
    checkAutoSyncStatusIfNeeded();
  }, [checkAutoSyncStatusIfNeeded, cycle, onlyLocal]);

  // refresh the sync status right after a background auto-sync tick finishes, while this
  // screen is mounted (it stays mounted, just unfocused, while the user is on another screen,
  // e.g. editing a record - see the focus handler below for the case where a tick finished
  // while the screen was unfocused instead)
  const autoSyncUploadRunningPrevRef = useRef(false);
  useEffect(() => {
    if (autoSyncUploadRunningPrevRef.current && !autoSyncUploadRunning) {
      checkAutoSyncStatusIfNeeded();
    }
    autoSyncUploadRunningPrevRef.current = autoSyncUploadRunning;
  }, [autoSyncUploadRunning, checkAutoSyncStatusIfNeeded]);

  // refresh records list (and, if eligible, sync status) whenever this screen regains focus,
  // e.g. coming back from editing a record: `loadRecords` alone would otherwise reset
  // syncStatusFetched to false and leave the auto-sync status icon showing a stale/unchecked
  // state until the next background tick happens to start and end while focused again.
  // Sequenced (not two independent focus listeners) so the network-based sync status refresh
  // always applies after, and is not overwritten by, the local-only reload.
  const onFocus = useCallback(async () => {
    await loadRecords();
    checkAutoSyncStatusIfNeeded();
  }, [loadRecords, checkAutoSyncStatusIfNeeded]);
  useNavigationFocus(onFocus);

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
    autoSyncEnabled,
    autoSyncStatus,
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
    onRevalidateAllRecordsPress,
    onRevalidateSelectedRecordUuids,
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
