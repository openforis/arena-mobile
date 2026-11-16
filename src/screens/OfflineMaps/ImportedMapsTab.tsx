import { useCallback, useMemo, useState } from "react";
import { useNavigator } from "navigation/navigator";
import * as DocumentPicker from "expo-document-picker";

import { DateFormats, Dates } from "@openforis/arena-core";

import {
  Button,
  Card,
  HView,
  IconButton,
  LoadingIcon,
  Switch,
  Text,
  VView,
} from "components";
import { useConfirmedAction, useFocusLoad, useToast } from "hooks";
import { ImportedMap } from "model";
import { ImportedMapsService } from "service";
import { SettingsActions, SettingsSelectors, useAppDispatch } from "state";
import { useAppTheme } from "theme";
import { Files, log } from "utils";

import styles from "./styles";

const PDF_MIME_TYPE = "application/pdf";

const formatDate = (isoDate: string): string =>
  Dates.format(new Date(isoDate), DateFormats.datetimeDisplay);

const ImportedMapItem = ({
  importedMap,
  onDeletePress,
  onViewPress,
  onVisibleChange,
}: Readonly<{
  importedMap: ImportedMap;
  onDeletePress: (importedMap: ImportedMap) => Promise<void>;
  onViewPress: (importedMap: ImportedMap) => void;
  onVisibleChange: (importedMap: ImportedMap, visible: boolean) => void;
}>) => {
  const theme = useAppTheme();
  const cardStyle = useMemo(
    () => [styles.areaCard, { borderColor: theme.colors.outline }],
    [theme],
  );
  return (
    <Card
      onPress={() => onViewPress(importedMap)}
      style={cardStyle}
      title={importedMap.name}
      titleVariant="titleLarge"
    >
      <Text
        textKey="importedMaps:map.fileName"
        textParams={{ fileName: importedMap.fileName }}
      />
      <Text
        textKey="importedMaps:map.page"
        textParams={{ page: importedMap.pageIndex + 1 }}
      />
      <Text
        textKey="importedMaps:map.zoomLevels"
        textParams={{
          minZoom: importedMap.minZoom,
          maxZoom: importedMap.maxZoom,
        }}
      />
      <Text
        textKey="importedMaps:map.tiles"
        textParams={{ count: importedMap.tilesCount }}
      />
      <Text
        textKey="importedMaps:map.size"
        textParams={{
          size: Files.toHumanReadableFileSize(importedMap.sizeBytes),
          sourceSize: Files.toHumanReadableFileSize(
            importedMap.sourceSizeBytes,
          ),
        }}
      />
      {!importedMap.datumCompatible && (
        <Text
          style={styles.warningText}
          textKey="importedMaps:map.datumWarning"
        />
      )}
      <HView style={styles.missingTilesRow}>
        <Text style={styles.storageLabel} textKey="importedMaps:map.visible" />
        <Switch
          onChange={(visible) => onVisibleChange(importedMap, visible)}
          value={importedMap.visible}
        />
      </HView>
      <HView style={styles.areaFooter}>
        <Text
          style={styles.areaLastUpdate}
          textKey="offlineMaps:area.lastUpdate"
          textParams={{ date: formatDate(importedMap.dateModified) }}
          variant="bodySmall"
        />
        <IconButton
          icon="trash-can-outline"
          onPress={() => onDeletePress(importedMap)}
        />
      </HView>
    </Card>
  );
};

export const ImportedMapsTab = () => {
  log.debug("rendering ImportedMapsTab");

  const navigator = useNavigator();
  const dispatch = useAppDispatch();
  const { confirmAndRun, running: deleting } = useConfirmedAction();
  const toaster = useToast();
  const settings = SettingsSelectors.useSettings();
  const rendererAvailable = ImportedMapsService.isRendererAvailable();

  const importedMaps = useMemo(
    () =>
      [...(settings.importedMaps ?? [])].sort((mapA, mapB) =>
        mapA.name.localeCompare(mapB.name),
      ),
    [settings.importedMaps],
  );

  const [storageSize, setStorageSize] = useState<number | null>(null);
  const [freeDiskStorage, setFreeDiskStorage] = useState<number | null>(null);

  const fetchStorageInfo = useCallback(
    () =>
      Promise.all([
        ImportedMapsService.getStorageSize(),
        Files.getFreeDiskStorage(),
      ]).then(([size, freeSpace]) => {
        setStorageSize(size);
        setFreeDiskStorage(freeSpace);
      }),
    [],
  );

  const resetStorageSize = useCallback(() => setStorageSize(null), []);

  // storage size is initially null
  const loadStorageInfo = useFocusLoad({
    fetch: fetchStorageInfo,
    reset: resetStorageSize,
  });

  const onImportPress = useCallback(async () => {
    try {
      const { assets, canceled } = await DocumentPicker.getDocumentAsync({
        type: PDF_MIME_TYPE,
        copyToCacheDirectory: true,
      });
      const asset = assets?.[0];
      if (canceled || !asset) return;
      navigator.navigateToMapImport({
        fileUri: asset.uri,
        fileName: asset.name,
      });
    } catch (error) {
      log.error("error selecting PDF file", error);
      toaster("importedMaps:import.errorReading", { details: String(error) });
    }
  }, [navigator, toaster]);

  const onViewPress = useCallback(
    (importedMap: ImportedMap) => {
      navigator.navigateToImportedMapViewer({ mapId: importedMap.id });
    },
    [navigator],
  );

  const onVisibleChange = useCallback(
    (importedMap: ImportedMap, visible: boolean) => {
      void dispatch(
        SettingsActions.updateImportedMap({
          mapId: importedMap.id,
          changes: { visible },
        }),
      );
    },
    [dispatch],
  );

  const onDeletePress = useCallback(
    async (importedMap: ImportedMap) => {
      if (
        await confirmAndRun(
          {
            messageKey: "importedMaps:map.deleteConfirm",
            messageParams: { name: importedMap.name },
          },
          () => dispatch(SettingsActions.deleteImportedMap(importedMap.id)),
        )
      ) {
        await loadStorageInfo();
      }
    },
    [confirmAndRun, dispatch, loadStorageInfo],
  );

  return (
    <VView style={styles.container}>
      <Text style={styles.description} textKey="importedMaps:description" />
      {!rendererAvailable && (
        <Card style={styles.warningCard}>
          <Text
            style={styles.warningText}
            textKey="importedMaps:rendererNotAvailable"
          />
        </Card>
      )}
      <Card style={styles.storageCard}>
        <HView style={styles.storageRow}>
          <Text
            style={styles.storageLabel}
            textKey="importedMaps:storage.used"
          />
          {storageSize === null ? (
            <LoadingIcon size={16} />
          ) : (
            <Text>{Files.toHumanReadableFileSize(storageSize)}</Text>
          )}
        </HView>
        <HView style={styles.storageRow}>
          <Text textKey="offlineMaps:storage.free" />
          {freeDiskStorage !== null && (
            <Text>{Files.toHumanReadableFileSize(freeDiskStorage)}</Text>
          )}
        </HView>
      </Card>
      <HView style={styles.buttonsRow}>
        <Button
          disabled={!rendererAvailable || deleting}
          icon="file-pdf-box"
          onPress={onImportPress}
          textKey="importedMaps:importPdf"
        />
      </HView>
      {deleting && <LoadingIcon />}
      {importedMaps.length === 0 && (
        <Text style={styles.emptyText} textKey="importedMaps:noMaps" />
      )}
      {importedMaps.map((importedMap) => (
        <ImportedMapItem
          key={importedMap.id}
          importedMap={importedMap}
          onDeletePress={onDeletePress}
          onViewPress={onViewPress}
          onVisibleChange={onVisibleChange}
        />
      ))}
    </VView>
  );
};
