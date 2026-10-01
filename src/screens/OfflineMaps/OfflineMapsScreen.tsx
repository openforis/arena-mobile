import { useCallback, useState } from "react";
import { useNavigation } from "@react-navigation/native";

import { DateFormats, Dates } from "@openforis/arena-core";

import {
  Button,
  Card,
  HView,
  IconButton,
  LoadingIcon,
  ScreenView,
  Text,
  VView,
} from "components";
import { useNavigationFocus } from "hooks";
import { useTranslation } from "localization";
import { MapLayers, MapProvider, OfflineMapArea, SettingsModel } from "model";
import { screenKeys } from "screens/screenKeys";
import { OfflineMapsService } from "service";
import {
  SettingsActions,
  SettingsSelectors,
  useAppDispatch,
  useConfirm,
} from "state";
import { Files, GeoUtils, log } from "utils";

import { useOfflineMapAreaDownload } from "./useOfflineMapAreaDownload";
import styles from "./styles";

type State = {
  areas: OfflineMapArea[];
  loading: boolean;
  deleting: boolean;
  tilesStorageSize: number | null;
  freeDiskStorage: number | null;
};

const formatDate = (isoDate: string): string =>
  Dates.format(new Date(isoDate), DateFormats.datetimeDisplay);

const OfflineMapAreaItem = ({
  area,
  onDeletePress,
  onResumePress,
  onViewPress,
}: Readonly<{
  area: OfflineMapArea;
  onDeletePress: (area: OfflineMapArea) => Promise<void>;
  onViewPress: (area: OfflineMapArea) => void;
  onResumePress: (area: OfflineMapArea) => Promise<void>;
}>) => {
  const { t } = useTranslation();
  const layer = MapLayers.getLayer(area.layerId);
  const missingTiles = area.tilesCount - area.downloadedTilesCount;
  return (
    <Card onPress={() => onViewPress(area)} style={styles.areaCard}>
      <Text variant="titleLarge">{area.name}</Text>
      <Text
        textKey="offlineMaps:area.surface"
        textParams={{
          area: GeoUtils.formatArea(
            OfflineMapsService.getAreaSquareMeters(area),
          ),
        }}
      />
      <Text
        textKey="offlineMaps:area.layer"
        textParams={{ layer: t(`offlineMaps:layers.${layer.id}`) }}
      />
      <Text
        textKey="offlineMaps:area.zoomLevels"
        textParams={{ minZoom: area.minZoom, maxZoom: area.maxZoom }}
      />
      <Text
        textKey="offlineMaps:area.tiles"
        textParams={{
          downloaded: area.downloadedTilesCount,
          total: area.tilesCount,
        }}
      />
      <Text
        textKey="offlineMaps:area.size"
        textParams={{ size: Files.toHumanReadableFileSize(area.sizeBytes) }}
      />
      {missingTiles > 0 && (
        <HView style={styles.missingTilesRow}>
          <Text
            style={styles.warningText}
            textKey="offlineMaps:area.missingTiles"
            textParams={{ count: missingTiles }}
          />
          <Button
            compact
            icon="download"
            mode="text"
            onPress={() => onResumePress(area)}
            textKey="offlineMaps:area.resumeDownload"
          />
        </HView>
      )}
      <HView style={styles.areaFooter}>
        <Text
          style={styles.areaLastUpdate}
          textKey="offlineMaps:area.lastUpdate"
          textParams={{ date: formatDate(area.dateModified) }}
          variant="bodySmall"
        />
        <IconButton
          icon="trash-can-outline"
          onPress={() => onDeletePress(area)}
        />
      </HView>
    </Card>
  );
};

export const OfflineMapsScreen = () => {
  log.debug("rendering OfflineMapsScreen");

  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const confirm = useConfirm();
  const downloadArea = useOfflineMapAreaDownload();
  const settings = SettingsSelectors.useSettings();

  const [state, setState] = useState<State>({
    areas: [],
    loading: true,
    deleting: false,
    tilesStorageSize: null,
    freeDiskStorage: null,
  });
  const { areas, loading, deleting, tilesStorageSize, freeDiskStorage } = state;

  const loadAreas = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    const [areasLoaded, freeDiskStorageLoaded] = await Promise.all([
      OfflineMapsService.fetchAreas(),
      Files.getFreeDiskStorage(),
    ]);
    // default area names are "Area YYYY-MM-DD HH:mm": sorting by name also sorts them chronologically
    areasLoaded.sort((areaA, areaB) => areaA.name.localeCompare(areaB.name));
    setState((prev) => ({
      ...prev,
      areas: areasLoaded,
      loading: false,
      freeDiskStorage: freeDiskStorageLoaded,
      tilesStorageSize: null,
    }));
    // computing the size of the tiles folder can take a while: do it after the areas are shown
    const size = await OfflineMapsService.getTilesStorageSize();
    setState((prev) => ({ ...prev, tilesStorageSize: size }));
  }, []);

  useNavigationFocus(loadAreas);

  const onAddAreaPress = useCallback(() => {
    navigation.navigate(screenKeys.offlineMapAreaEditor as never);
  }, [navigation]);

  const onViewPress = useCallback(
    (area: OfflineMapArea) => {
      navigation.navigate(
        ...([screenKeys.offlineMapAreaViewer, { areaId: area.id }] as never),
      );
    },
    [navigation],
  );

  const onDeletePress = useCallback(
    async (area: OfflineMapArea) => {
      if (
        await confirm({
          messageKey: "offlineMaps:area.deleteConfirm",
          messageParams: { name: area.name },
        })
      ) {
        setState((prev) => ({ ...prev, deleting: true }));
        try {
          await OfflineMapsService.deleteArea(area.id);
        } finally {
          setState((prev) => ({ ...prev, deleting: false }));
        }
        await loadAreas();
      }
    },
    [confirm, loadAreas],
  );

  const onDeleteAllPress = useCallback(async () => {
    if (await confirm({ messageKey: "offlineMaps:deleteAllConfirm" })) {
      setState((prev) => ({ ...prev, deleting: true }));
      try {
        await OfflineMapsService.deleteAllAreas();
      } finally {
        setState((prev) => ({ ...prev, deleting: false }));
      }
      await loadAreas();
    }
  }, [confirm, loadAreas]);

  const onResumePress = useCallback(
    async (area: OfflineMapArea) => {
      await downloadArea(area);
      await loadAreas();
    },
    [downloadArea, loadAreas],
  );

  const onUseFreeLayersPress = useCallback(() => {
    dispatch(
      SettingsActions.updateSetting({
        key: SettingsModel.SettingKey.mapProvider,
        value: MapProvider.freeLayers,
      }),
    );
  }, [dispatch]);

  return (
    <ScreenView>
      <VView style={styles.container}>
        <Text style={styles.description} textKey="offlineMaps:description" />
        {settings.mapProvider !== MapProvider.freeLayers && (
          <Card style={styles.warningCard}>
            <Text textKey="offlineMaps:freeLayersNotInUse" />
            <Button
              icon="map"
              mode="text"
              onPress={onUseFreeLayersPress}
              textKey="offlineMaps:useFreeLayers"
            />
          </Card>
        )}
        <Card style={styles.storageCard}>
          <HView style={styles.storageRow}>
            <Text textKey="offlineMaps:storage.used" />
            {tilesStorageSize === null ? (
              <LoadingIcon size={16} />
            ) : (
              <Text>{Files.toHumanReadableFileSize(tilesStorageSize)}</Text>
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
            icon="vector-polygon"
            onPress={onAddAreaPress}
            textKey="offlineMaps:addArea"
          />
          {areas.length > 0 && (
            <Button
              color="secondary"
              icon="trash-can-outline"
              loading={deleting}
              disabled={deleting}
              onPress={onDeleteAllPress}
              textKey="offlineMaps:deleteAll"
            />
          )}
        </HView>
        {loading && <LoadingIcon />}
        {!loading && areas.length === 0 && (
          <Text style={styles.emptyText} textKey="offlineMaps:noAreas" />
        )}
        {areas.map((area) => (
          <OfflineMapAreaItem
            key={area.id}
            area={area}
            onDeletePress={onDeletePress}
            onResumePress={onResumePress}
            onViewPress={onViewPress}
          />
        ))}
      </VView>
    </ScreenView>
  );
};
