import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigator } from "navigation/navigator";

import { useNavigationBlur, useNavigationFocus, useToast } from "hooks";
import { RecordService } from "service";
import {
  AutoSyncSelectors,
  AutoSyncStatus,
  DataEntryActions,
  RemoteConnectionSelectors,
  SurveySelectors,
  useAppDispatch,
  wasRecentlyCheckedWithNoNewLocalChanges,
} from "state";
import { log } from "utils";

import { fetchRecordsWithSyncStatus } from "./fetchRecordsWithSyncStatus";
import type { RecordSummaryWithSyncStatus } from "./recordsListTypes";

export type RecordsListState = {
  loading: boolean;
  onlyLocal: boolean;
  records: RecordSummaryWithSyncStatus[];
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

// state set when the records start being (re)loaded
const loadingStartState: Partial<RecordsListState> = {
  loading: true,
  syncStatusFetched: false,
  syncStatusLoading: false,
};

type UseRecordsListLoadParams = {
  autoSyncEnabled: boolean;
  autoSyncUploadRunning: boolean;
  cycle: ReturnType<typeof SurveySelectors.useCurrentSurveyCycle>;
  dispatch: ReturnType<typeof useAppDispatch>;
  isDemoSurvey: boolean;
  loggedInUser: ReturnType<typeof RemoteConnectionSelectors.useLoggedInUser>;
  navigator: ReturnType<typeof useNavigator>;
  networkAvailable: boolean;
  survey: ReturnType<typeof SurveySelectors.useCurrentSurvey>;
  toaster: ReturnType<typeof useToast>;
};

export const useRecordsListLoad = ({
  autoSyncEnabled,
  autoSyncUploadRunning,
  cycle,
  dispatch,
  isDemoSurvey,
  loggedInUser,
  navigator,
  networkAvailable,
  survey,
  toaster,
}: UseRecordsListLoadParams) => {
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
  useEffect(() => {
    recordsRef.current = records;
  }, [records]);
  // incremented by every records load: only the latest one's response is applied
  const loadRequestIdRef = useRef(0);

  const setLoading = useCallback(
    (loadingUpdated: boolean) =>
      setState((statePrev) => ({ ...statePrev, loading: loadingUpdated })),
    [],
  );

  // called by an effect too: state set only in the promise callbacks, the caller sets the loading state
  const fetchRecords = useCallback(() => {
    const requestId = ++loadRequestIdRef.current;
    if (!survey) {
      // no survey selected (yet): nothing to load; state set in the promise callback, like the fetch
      return Promise.resolve().then(() => {
        if (requestId !== loadRequestIdRef.current) return;
        setState((statePrev) => ({
          ...statePrev,
          records: [],
          loading: false,
        }));
      });
    }
    return RecordService.fetchRecords({ survey, cycle, onlyLocal }).then(
      (_records) => {
        if (requestId !== loadRequestIdRef.current) return;

        setState((statePrev) => ({
          ...statePrev,
          records: _records,
          loading: false,
        }));
      },
      (error) => {
        if (requestId !== loadRequestIdRef.current) return;
        setState((statePrev) => ({
          ...statePrev,
          records: [],
          loading: false,
        }));
        toaster("dataEntry:errorLoadingRecords", { details: String(error) });
      },
    );
  }, [survey, cycle, onlyLocal, toaster]);

  const loadRecords = useCallback(async () => {
    setState((statePrev) => ({ ...statePrev, ...loadingStartState }));
    await fetchRecords();
  }, [fetchRecords]);

  const loadRecordsWithSyncStatus =
    useCallback(async (): Promise<RecordsListState> => {
      log.debug(
        `loadRecordsWithSyncStatus: starting (survey=${survey?.uuid}, cycle=${cycle}, onlyLocal=${onlyLocal})`,
      );
      const requestId = ++loadRequestIdRef.current;
      setState((statePrev) => ({
        ...statePrev,
        syncStatusLoading: true,
        syncStatusFetched: false,
      }));
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
      const { records: _records, syncStatusFetched: _syncStatusFetched } =
        await fetchRecordsWithSyncStatus({
          cycle,
          dispatch,
          navigator,
          onlyLocal,
          survey,
        });
      if (requestId !== loadRequestIdRef.current) {
        // superseded by a newer load (e.g. after a cycle change): its result must not be used
        return {
          ...stateNext,
          records: recordsRef.current,
        } as RecordsListState;
      }
      if (_syncStatusFetched) {
        Object.assign(stateNext, {
          records: _records,
          syncStatusFetched: true,
        });
      }
      setState((statePrev) => ({ ...statePrev, ...stateNext }));
      return {
        ...stateNext,
        records: stateNext.records ?? recordsRef.current,
      } as RecordsListState;
    }, [dispatch, navigator, survey, cycle, onlyLocal]);

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
  useEffect(() => {
    autoSyncThrottleStateRef.current = {
      lastCheckedAt: autoSyncLastCheckedAt,
      lastLocalChangeAt: autoSyncLastLocalChangeAt,
    };
  }, [autoSyncLastCheckedAt, autoSyncLastLocalChangeAt]);

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
      dispatch(
        DataEntryActions.runAutoSync({ prefetchedRecords: fetchedRecords }),
      );
    }
  }, [canCheckAutoSyncStatus, loadRecordsWithSyncStatus, dispatch]);

  const checkAutoSyncStatusIfNeededRef = useRef(checkAutoSyncStatusIfNeeded);
  useEffect(() => {
    checkAutoSyncStatusIfNeededRef.current = checkAutoSyncStatusIfNeeded;
  }, [checkAutoSyncStatusIfNeeded]);

  // sequenced so the network-based sync status refresh always applies after the local-only reload
  const refreshRecords = useCallback(async () => {
    await loadRecords();
    checkAutoSyncStatusIfNeededRef.current();
  }, [loadRecords]);

  // survey, cycle or "only local" changed: reset the search and set the loading state
  const [loadParamsPrev, setLoadParamsPrev] = useState({
    survey,
    cycle,
    onlyLocal,
  });
  if (
    survey !== loadParamsPrev.survey ||
    cycle !== loadParamsPrev.cycle ||
    onlyLocal !== loadParamsPrev.onlyLocal
  ) {
    setLoadParamsPrev({ survey, cycle, onlyLocal });
    setState((statePrev) => ({
      ...statePrev,
      ...loadingStartState,
      searchValue: "",
    }));
  }

  // initial load and reload on survey, cycle or "only local" change (loading state set above)
  useEffect(() => {
    fetchRecords().then(() => checkAutoSyncStatusIfNeededRef.current());
  }, [fetchRecords]);

  // check the sync status as soon as it becomes possible (e.g. network back, user logged in)
  const canCheckAutoSyncStatusPrevRef = useRef(canCheckAutoSyncStatus);
  useEffect(() => {
    if (canCheckAutoSyncStatus && !canCheckAutoSyncStatusPrevRef.current) {
      checkAutoSyncStatusIfNeeded();
    }
    canCheckAutoSyncStatusPrevRef.current = canCheckAutoSyncStatus;
  }, [canCheckAutoSyncStatus, checkAutoSyncStatusIfNeeded]);

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
  // e.g. coming back from editing a record; the first focus is covered by the initial load above
  const blurredRef = useRef(false);
  const onBlur = useCallback(() => {
    blurredRef.current = true;
  }, []);
  useNavigationBlur(onBlur);
  const onFocus = useCallback(() => {
    if (blurredRef.current) refreshRecords();
  }, [refreshRecords]);
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

  return {
    autoSyncStatus,
    loading,
    loadRecords,
    loadRecordsWithSyncStatus,
    onlyLocal,
    onOnlyLocalChange,
    onRemoteSyncPress,
    onSearchValueChange,
    records,
    searchValue,
    setLoading,
    syncStatusFetched,
    syncStatusLoading,
  };
};
