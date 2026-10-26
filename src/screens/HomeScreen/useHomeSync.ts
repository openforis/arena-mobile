import { useCallback, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";

import { useIsNetworkConnected, useToast } from "hooks";
import {
  AutoSyncSelectors,
  AutoSyncStatus,
  SettingsSelectors,
  SurveySelectors,
  useAppDispatch,
} from "state";

import { fetchRecordsWithSyncStatus } from "../RecordsList/fetchRecordsWithSyncStatus";
import { useRecordsExport } from "../RecordsList/useRecordsExport";
import { RecordsListState } from "../RecordsList/useRecordsList";

type Props = {
  onSyncEnd: () => void;
  records: any[];
};

// same "Send data" flow as the records list (confirmation, conflicts resolution, upload job)
export const useHomeSync = ({ onSyncEnd, records }: Props) => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const toaster = useToast();
  const networkAvailable = useIsNetworkConnected();
  const survey = SurveySelectors.useCurrentSurvey();
  const cycle = SurveySelectors.useCurrentSurveyCycle();
  const isDemoSurvey = SurveySelectors.useIsCurrentSurveyDemo();
  const { autoSyncEnabled } = SettingsSelectors.useSettings();
  const { status: autoSyncStatus } = AutoSyncSelectors.useAutoSyncState();

  const [syncing, setSyncing] = useState(false);
  const recordsRef = useRef(records);
  recordsRef.current = records;

  const loadRecordsWithSyncStatus =
    useCallback(async (): Promise<RecordsListState> => {
      const { records: recordsWithSyncStatus, syncStatusFetched } =
        await fetchRecordsWithSyncStatus({
          cycle,
          dispatch,
          navigation,
          onlyLocal: true,
          survey,
        });
      onSyncEnd();
      return {
        loading: false,
        onlyLocal: true,
        records: recordsWithSyncStatus ?? recordsRef.current,
        searchValue: "",
        syncStatusFetched,
        syncStatusLoading: false,
      };
    }, [cycle, dispatch, navigation, onSyncEnd, survey]);

  const { onSendDataPress } = useRecordsExport({
    cycle,
    isDemoSurvey,
    loadRecordsWithSyncStatus,
    networkAvailable,
    records,
    setLoading: setSyncing,
    survey,
  });

  const onSyncPress = useCallback(async () => {
    if (!networkAvailable) {
      toaster("common:networkNotAvailable");
      return;
    }
    setSyncing(true);
    try {
      await onSendDataPress();
    } finally {
      setSyncing(false);
    }
  }, [networkAvailable, onSendDataPress, toaster]);

  // as in the records list: with auto-sync on, keep it available only to resolve sync errors
  const syncAvailable =
    !isDemoSurvey &&
    records.length > 0 &&
    (!autoSyncEnabled || autoSyncStatus === AutoSyncStatus.error);

  return { autoSyncEnabled, onSyncPress, syncAvailable, syncing };
};
