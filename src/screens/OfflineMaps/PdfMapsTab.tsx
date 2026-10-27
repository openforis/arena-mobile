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
import { useNavigationFocus, useToast } from "hooks";
import { PdfMap } from "model";
import { PdfMapsService } from "service";
import {
  SettingsActions,
  SettingsSelectors,
  useAppDispatch,
  useConfirm,
} from "state";
import { useAppTheme } from "theme";
import { Files, log } from "utils";

import styles from "./styles";

const PDF_MIME_TYPE = "application/pdf";

const formatDate = (isoDate: string): string =>
  Dates.format(new Date(isoDate), DateFormats.datetimeDisplay);

const PdfMapItem = ({
  pdfMap,
  onDeletePress,
  onViewPress,
  onVisibleChange,
}: Readonly<{
  pdfMap: PdfMap;
  onDeletePress: (pdfMap: PdfMap) => Promise<void>;
  onViewPress: (pdfMap: PdfMap) => void;
  onVisibleChange: (pdfMap: PdfMap, visible: boolean) => void;
}>) => {
  const theme = useAppTheme();
  const cardStyle = useMemo(
    () => [styles.areaCard, { borderColor: theme.colors.outline }],
    [theme],
  );
  return (
    <Card
      onPress={() => onViewPress(pdfMap)}
      style={cardStyle}
      title={pdfMap.name}
      titleVariant="titleLarge"
    >
      <Text
        textKey="pdfMaps:map.fileName"
        textParams={{ fileName: pdfMap.fileName }}
      />
      <Text
        textKey="pdfMaps:map.page"
        textParams={{ page: pdfMap.pageIndex + 1 }}
      />
      <Text
        textKey="pdfMaps:map.zoomLevels"
        textParams={{ minZoom: pdfMap.minZoom, maxZoom: pdfMap.maxZoom }}
      />
      <Text
        textKey="pdfMaps:map.tiles"
        textParams={{ count: pdfMap.tilesCount }}
      />
      <Text
        textKey="pdfMaps:map.size"
        textParams={{
          size: Files.toHumanReadableFileSize(pdfMap.sizeBytes),
          sourceSize: Files.toHumanReadableFileSize(pdfMap.sourceSizeBytes),
        }}
      />
      {!pdfMap.datumCompatible && (
        <Text style={styles.warningText} textKey="pdfMaps:map.datumWarning" />
      )}
      <HView style={styles.missingTilesRow}>
        <Text style={styles.storageLabel} textKey="pdfMaps:map.visible" />
        <Switch
          onChange={(visible) => onVisibleChange(pdfMap, visible)}
          value={pdfMap.visible}
        />
      </HView>
      <HView style={styles.areaFooter}>
        <Text
          style={styles.areaLastUpdate}
          textKey="offlineMaps:area.lastUpdate"
          textParams={{ date: formatDate(pdfMap.dateModified) }}
          variant="bodySmall"
        />
        <IconButton
          icon="trash-can-outline"
          onPress={() => onDeletePress(pdfMap)}
        />
      </HView>
    </Card>
  );
};

export const PdfMapsTab = () => {
  log.debug("rendering PdfMapsTab");

  const navigator = useNavigator();
  const dispatch = useAppDispatch();
  const confirm = useConfirm();
  const toaster = useToast();
  const settings = SettingsSelectors.useSettings();
  const rendererAvailable = PdfMapsService.isRendererAvailable();

  const pdfMaps = useMemo(
    () =>
      [...(settings.pdfMaps ?? [])].sort((mapA, mapB) =>
        mapA.name.localeCompare(mapB.name),
      ),
    [settings.pdfMaps],
  );

  const [storageSize, setStorageSize] = useState<number | null>(null);
  const [freeDiskStorage, setFreeDiskStorage] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadStorageInfo = useCallback(async () => {
    setStorageSize(null);
    const [size, freeSpace] = await Promise.all([
      PdfMapsService.getStorageSize(),
      Files.getFreeDiskStorage(),
    ]);
    setStorageSize(size);
    setFreeDiskStorage(freeSpace);
  }, []);

  useNavigationFocus(loadStorageInfo);

  const onImportPress = useCallback(async () => {
    try {
      const { assets, canceled } = await DocumentPicker.getDocumentAsync({
        type: PDF_MIME_TYPE,
        copyToCacheDirectory: true,
      });
      const asset = assets?.[0];
      if (canceled || !asset) return;
      navigator.navigateToPdfMapImport({
        fileUri: asset.uri,
        fileName: asset.name,
      });
    } catch (error) {
      log.error("error selecting PDF file", error);
      toaster("pdfMaps:import.errorReading", { details: String(error) });
    }
  }, [navigator, toaster]);

  const onViewPress = useCallback(
    (pdfMap: PdfMap) => {
      navigator.navigateToPdfMapViewer({ mapId: pdfMap.id });
    },
    [navigator],
  );

  const onVisibleChange = useCallback(
    (pdfMap: PdfMap, visible: boolean) => {
      void dispatch(
        SettingsActions.updatePdfMap({
          mapId: pdfMap.id,
          changes: { visible },
        }),
      );
    },
    [dispatch],
  );

  const onDeletePress = useCallback(
    async (pdfMap: PdfMap) => {
      if (
        await confirm({
          messageKey: "pdfMaps:map.deleteConfirm",
          messageParams: { name: pdfMap.name },
        })
      ) {
        setDeleting(true);
        try {
          await dispatch(SettingsActions.deletePdfMap(pdfMap.id));
        } finally {
          setDeleting(false);
        }
        await loadStorageInfo();
      }
    },
    [confirm, dispatch, loadStorageInfo],
  );

  return (
    <VView style={styles.container}>
      <Text style={styles.description} textKey="pdfMaps:description" />
      {!rendererAvailable && (
        <Card style={styles.warningCard}>
          <Text
            style={styles.warningText}
            textKey="pdfMaps:rendererNotAvailable"
          />
        </Card>
      )}
      <Card style={styles.storageCard}>
        <HView style={styles.storageRow}>
          <Text style={styles.storageLabel} textKey="pdfMaps:storage.used" />
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
          textKey="pdfMaps:importPdf"
        />
      </HView>
      {deleting && <LoadingIcon />}
      {pdfMaps.length === 0 && (
        <Text style={styles.emptyText} textKey="pdfMaps:noMaps" />
      )}
      {pdfMaps.map((pdfMap) => (
        <PdfMapItem
          key={pdfMap.id}
          pdfMap={pdfMap}
          onDeletePress={onDeletePress}
          onViewPress={onViewPress}
          onVisibleChange={onVisibleChange}
        />
      ))}
    </VView>
  );
};
