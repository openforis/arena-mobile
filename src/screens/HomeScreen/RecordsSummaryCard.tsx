import { useNavigation } from "@react-navigation/native";
import { useCallback } from "react";
import { StyleSheet } from "react-native";

import { AutoSyncStatusIcon } from "appComponents/AutoSyncStatus";
import { Button, HView, Surface, Text } from "components";
import { useEffectiveTheme } from "hooks";
import { SurveySelectors } from "state";

import { screenKeys } from "../screenKeys";
import { StatTile } from "./StatTile";
import { useHomeSync } from "./useHomeSync";
import { useRecordsSummary } from "./useRecordsSummary";

const toUploadColor = "#D17A00";

const styles = StyleSheet.create({
  container: { borderRadius: 20, padding: 14, gap: 8 },
  header: {
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    minHeight: 40,
    paddingStart: 4,
  },
  title: { fontWeight: "700" },
  headerRight: { alignItems: "center", flexShrink: 1 },
  buttonsContainer: { gap: 8, marginTop: 4 },
  goToDataEntryButton: { flex: 1, paddingVertical: 4 },
  syncButton: { paddingVertical: 4 },
});

export const RecordsSummaryCard = () => {
  const navigation = useNavigation();
  const theme = useEffectiveTheme();
  const isDemoSurvey = SurveySelectors.useIsCurrentSurveyDemo();
  const {
    lastModified,
    notUploadedCount,
    records,
    reload,
    totalCount,
    withErrorsCount,
  } = useRecordsSummary();
  const { autoSyncEnabled, onSyncPress, syncAvailable, syncing } = useHomeSync({
    onSyncEnd: reload,
    records,
  });

  const onGoToDataEntryPress = useCallback(
    () => navigation.navigate(screenKeys.recordsList as never),
    [navigation],
  );

  return (
    <Surface elevation={2} style={styles.container}>
      <HView style={styles.header}>
        <Text
          style={styles.title}
          textKey="home:records"
          variant="titleSmall"
        />
        <HView style={styles.headerRight}>
          {lastModified && (
            <Text
              numberOfLines={1}
              style={{ color: theme.colors.onSurfaceVariant }}
              textKey="home:lastEdit"
              textParams={{ date: lastModified }}
              variant="bodySmall"
            />
          )}
          {autoSyncEnabled && !isDemoSurvey && <AutoSyncStatusIcon />}
        </HView>
      </HView>
      <HView>
        <StatTile
          icon="file-document-multiple-outline"
          labelKey="home:recordsTotal"
          value={totalCount}
        />
        <StatTile
          highlightColor={toUploadColor}
          icon="cloud-upload-outline"
          labelKey="home:recordsToUpload"
          value={notUploadedCount}
        />
        <StatTile
          highlightColor={theme.colors.error}
          icon="alert-circle-outline"
          labelKey="home:recordsWithErrors"
          value={withErrorsCount}
        />
      </HView>
      <HView style={styles.buttonsContainer}>
        <Button
          icon="format-list-bulleted"
          labelVariant="bodyLarge"
          onPress={onGoToDataEntryPress}
          style={styles.goToDataEntryButton}
          textKey="dataEntry:goToDataEntry"
        />
        {syncAvailable && (
          <Button
            color="secondary"
            icon="cloud-sync-outline"
            labelVariant="bodyLarge"
            loading={syncing}
            onPress={onSyncPress}
            style={styles.syncButton}
            textKey="home:sync"
          />
        )}
      </HView>
    </Surface>
  );
};
