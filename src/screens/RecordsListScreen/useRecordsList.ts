import { useMemo } from "react";
import { useNavigator } from "navigation/navigator";

import { Objects, Surveys } from "@openforis/arena-core";

import { useIsNetworkConnected, useToast } from "hooks";
import { useTranslation } from "localization";
import { RecordUtils } from "model";
import {
  RemoteConnectionSelectors,
  SettingsSelectors,
  SurveySelectors,
  useAppDispatch,
  useConfirm,
} from "state";
import { useJobMonitor } from "state/jobMonitor/useJobMonitor";

import { useRecordsListActions } from "./useRecordsListActions";
import { useRecordsListLoad } from "./useRecordsListLoad";

export type { RecordsListState } from "./useRecordsListLoad";

export const useRecordsList = () => {
  const navigator = useNavigator();
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

  const autoSyncEnabled = SettingsSelectors.useAutoSyncEnabled();
  const loggedInUser = RemoteConnectionSelectors.useLoggedInUser();
  // the only job that runs silently in this app is the background auto-sync upload (see
  // actionsAutoSync.ts); used here just to know when to refresh this screen's own per-record
  // list after a tick uploads something - the shared aggregate status lives in the autoSync
  // redux slice instead (AutoSyncSelectors), so other screens don't need this at all
  const { isOpen: jobIsOpen, silent: jobIsSilent } = useJobMonitor();
  const autoSyncUploadRunning = jobIsOpen && jobIsSilent;

  const {
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
  } = useRecordsListLoad({
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
  });

  const {
    onCloneSelectedRecordUuids,
    onDeleteSelectedRecordUuids,
    onFetchSelectedRecordUuids,
    onImportRecordsFromFilePress,
    onNewRecordPress,
    onRevalidateAllRecordsPress,
    onRevalidateSelectedRecordUuids,
  } = useRecordsListActions({
    confirm,
    dispatch,
    loadRecords,
    navigator,
    records,
    setLoading,
    toaster,
  });

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
