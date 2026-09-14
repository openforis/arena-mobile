import { useMemo } from "react";

import {
  Button,
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
          {!isDemoSurvey && (
            <Button
              icon="cloud-refresh"
              onPress={onSendDataPress}
              textKey="dataEntry:sendData"
            />
          )}
          <MenuButton
            anchorPosition="top"
            icon="download"
            items={downloadMenuItems}
            menuStyle={styles.exportDataButtonMenu}
          />
        </HView>
      )}
    </VView>
  );
};
