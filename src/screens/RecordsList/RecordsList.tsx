import { useCallback, useMemo, useState } from "react";

import { AutoSyncStatusIcon } from "appComponents/AutoSyncStatus";
import {
  Button,
  FlexWrapView,
  HView,
  Loader,
  MenuButton,
  Searchbar,
  Text,
  VView,
} from "components";

import { RecordsDataVisualizer } from "./RecordsDataVisualizer";
import { RecordsListLegend } from "./RecordsListLegend";
import { RecordsListOptions } from "./RecordsListOptions";
import { minRecordsToShowSearchBar } from "./recordsListUtils";
import { useRecordsExport } from "./useRecordsExport";
import { useRecordsList } from "./useRecordsList";

import styles from "./styles";

export const RecordsList = () => {
  const {
    autoSyncEnabled,
    cycle,
    defaultCycleKey,
    isDemoSurvey,
    loading,
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
  } = useRecordsList();

  const { downloadMenuItems, onExportSelectedRecordUuids, onSendDataPress } =
    useRecordsExport({
      cycle,
      isDemoSurvey,
      loadRecordsWithSyncStatus,
      networkAvailable,
      records,
      setLoading,
      survey,
      syncStatusFetched,
    });

  const [selectedRecordUuids, setSelectedRecordUuids] = useState<string[]>(
    [],
  );

  const onSendDataButtonPress = useCallback(
    () => onSendDataPress(selectedRecordUuids),
    [onSendDataPress, selectedRecordUuids],
  );

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
    [cycle, defaultCycleKey, onNewRecordPress],
  );

  const recordsLength = records?.length ?? 0;

  return (
    <VView style={styles.container}>
      <VView style={styles.innerContainer}>
        <RecordsListOptions
          onImportRecordsFromFilePress={onImportRecordsFromFilePress}
          onlyLocal={onlyLocal}
          onOnlyLocalChange={onOnlyLocalChange}
          onRemoteSyncPress={onRemoteSyncPress}
          onRevalidateAllRecordsPress={onRevalidateAllRecordsPress}
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
                onFetchSelectedRecordUuids={onFetchSelectedRecordUuids}
                onRevalidateSelectedRecordUuids={
                  onRevalidateSelectedRecordUuids
                }
                onSelectedRecordUuidsChange={setSelectedRecordUuids}
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
        // wraps onto multiple lines on a narrow screen instead of squeezing/overlapping;
        // stays a single row once there's enough width - same pattern as RecordsListOptions'
        // own button row above
        <FlexWrapView style={styles.bottomActionBar}>
          {newRecordButton}
          {!isDemoSurvey && !autoSyncEnabled && (
            <Button
              icon="cloud-refresh"
              onPress={onSendDataButtonPress}
              textKey="dataEntry:sendData"
            />
          )}
          <HView style={styles.autoSyncStatusItem}>
            <Text textKey="dataEntry:autoSync.statusLabel" />
            <AutoSyncStatusIcon />
          </HView>
          <MenuButton
            anchorPosition="top"
            icon="download"
            items={downloadMenuItems}
            menuStyle={styles.exportDataButtonMenu}
          />
        </FlexWrapView>
      )}
    </VView>
  );
};
