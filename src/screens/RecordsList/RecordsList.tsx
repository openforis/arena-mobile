import { useCallback, useMemo, useState } from "react";

import { Button, Loader, Searchbar, Text, VView } from "components";
import { AutoSyncStatus } from "state";

import { RecordsDataVisualizer } from "./RecordsDataVisualizer";
import { RecordsListLegend } from "./RecordsListLegend";
import { RecordsListOptions } from "./RecordsListOptions";
import { RecordsListDock } from "./RecordsListDock";
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

  const canCreateNewRecord = defaultCycleKey === cycle;

  const newRecordButton = useMemo(
    () =>
      canCreateNewRecord ? (
        <Button
          icon="plus"
          onPress={onNewRecordPress}
          style={styles.newRecordButton}
          labelVariant="bodyLarge"
          textKey="dataEntry:newRecord"
        />
      ) : null,
    [canCreateNewRecord, onNewRecordPress],
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
          onlyLocal={onlyLocal}
          onOnlyLocalChange={onOnlyLocalChange}
          onRevalidateAllRecordsPress={onRevalidateAllRecordsPress}
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
      <RecordsListDock
        downloadMenuItems={downloadMenuItems}
        onNewRecordPress={canCreateNewRecord ? onNewRecordPress : undefined}
        onSendDataPress={onSendDataButtonPress}
        showRecordActions={recordsLength > 0}
        showSendDataButton={showSendDataButton}
      />
    </VView>
  );
};
