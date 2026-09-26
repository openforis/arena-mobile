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
import { AutoSyncStatus } from "state";

import { RecordsDataVisualizer } from "./RecordsDataVisualizer";
import { RecordsListLegend } from "./RecordsListLegend";
import { RecordsListOptions } from "./RecordsListOptions";
import { RecordsListToolbar } from "./RecordsListToolbar";
import { minRecordsToShowSearchBar } from "./recordsListUtils";
import { useRecordsExport } from "./useRecordsExport";
import { useRecordsList } from "./useRecordsList";

import styles from "./styles";

export const RecordsList = () => {
  const {
    autoSyncEnabled,
    autoSyncStatus,
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

  // with auto-sync on, records needing a manual merge/overwrite decision (conflicts, modified
  // on the server too, ...) are never uploaded automatically: keep "Send data" available only
  // for them, so they can be resolved without having to turn auto-sync off first
  const showSendDataButton =
    !autoSyncEnabled || autoSyncStatus === AutoSyncStatus.error;

  return (
    <VView style={styles.container}>
      <VView style={styles.innerContainer}>
        <RecordsListOptions
          onImportRecordsFromFilePress={onImportRecordsFromFilePress}
          onRevalidateAllRecordsPress={onRevalidateAllRecordsPress}
        />
        <RecordsListToolbar
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
        // stays a single row once there's enough width - same pattern as RecordsListToolbar
        // above
        <FlexWrapView style={styles.bottomActionBar}>
          {newRecordButton}
          {!isDemoSurvey && (
            <>
              {showSendDataButton && (
                <Button
                  icon="cloud-refresh"
                  onPress={onSendDataButtonPress}
                  textKey="dataEntry:sendData"
                />
              )}
              {autoSyncEnabled && (
                <HView style={styles.autoSyncStatusItem}>
                  <Text textKey="dataEntry:autoSync.statusLabel" />
                  <AutoSyncStatusIcon />
                </HView>
              )}
            </>
          )}
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
