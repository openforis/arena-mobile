import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import RNMapView, { Polygon } from "react-native-maps";
import { useNavigation } from "@react-navigation/native";

import { Dates } from "@openforis/arena-core";

import {
  Dropdown,
  GeoPolygonEditor,
  HView,
  Slider,
  Text,
  TextInput,
  VView,
} from "components";
import type { MapPolygonExtendedProps } from "components/GeoPolygonEditor";
import { useToast } from "hooks";
import { LatLng, MapLayers, OfflineMapArea } from "model";
import { OfflineMapsService } from "service";
import { SettingsSelectors, useConfirm } from "state";
import { Files, GeoUtils, log } from "utils";

import { useOfflineMapAreaDownload } from "../OfflineMaps/useOfflineMapAreaDownload";
import styles from "./styles";

const existingAreaStrokeColor = "rgba(96, 96, 96, 0.9)";
const existingAreaFillColor = "rgba(96, 96, 96, 0.15)";

const layerItems = MapLayers.prefetchableLayers.map((layer) => ({
  value: layer.id,
  label: `offlineMaps:layers.${layer.id}`,
}));

const determineInitialLayerId = (settingsLayerId: string): string =>
  MapLayers.getLayer(settingsLayerId).prefetchAllowed
    ? settingsLayerId
    : MapLayers.defaultLayerId;

// year first, so that default names sort alphabetically in chronological order
const DEFAULT_AREA_NAME_DATE_FORMAT = "YYYY-MM-DD HH:mm";

const generateDefaultAreaName = (): string =>
  `Area ${Dates.format(new Date(), DEFAULT_AREA_NAME_DATE_FORMAT)}`;

export const OfflineMapAreaEditorScreen = () => {
  log.debug("rendering OfflineMapAreaEditorScreen");

  const navigation = useNavigation();
  const toaster = useToast();
  const confirm = useConfirm();
  const downloadArea = useOfflineMapAreaDownload();
  const settings = SettingsSelectors.useSettings();

  const mapRef = useRef<RNMapView | null>(null);

  const [name, setName] = useState(generateDefaultAreaName);
  const [layerId, setLayerId] = useState<string>(() =>
    determineInitialLayerId(settings.mapLayer),
  );
  const layer = MapLayers.getLayer(layerId);
  const [maxZoom, setMaxZoom] = useState(() =>
    Math.min(OfflineMapsService.DEFAULT_MAX_ZOOM, layer.maxZoom),
  );
  const [coordinates, setCoordinates] = useState<LatLng[]>([]);
  const [existingAreas, setExistingAreas] = useState<OfflineMapArea[] | null>(
    null,
  );
  const [freeDiskStorage, setFreeDiskStorage] = useState<number | null>(null);
  // zoom level of the tiles currently shown in the map
  const [currentZoom, setCurrentZoom] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [areas, freeSpace] = await Promise.all([
          OfflineMapsService.fetchAreas(),
          Files.getFreeDiskStorage(),
        ]);
        setExistingAreas(areas);
        setFreeDiskStorage(freeSpace);
      } catch (error) {
        log.error("error loading offline map areas", error);
        setExistingAreas([]);
      }
    };
    void loadData();
  }, []);

  const effectiveMaxZoom = Math.min(maxZoom, layer.maxZoom);

  const estimate = useMemo(
    () =>
      OfflineMapsService.estimateArea({
        coordinates,
        layerId,
        maxZoom: effectiveMaxZoom,
      }),
    [coordinates, effectiveMaxZoom, layerId],
  );

  const areaSquareMeters = useMemo(
    () => GeoUtils.computePolygonArea(coordinates),
    [coordinates],
  );

  // a blank name is replaced by the default one
  const effectiveName = name.trim() || generateDefaultAreaName();
  const nameErrorKey = OfflineMapsService.validateAreaName({
    name: effectiveName,
    areas: existingAreas ?? [],
  });

  const exceedsFreeSpace =
    freeDiskStorage !== null && estimate.estimatedSizeBytes > freeDiskStorage;
  const freeSpaceUsageRatio =
    freeDiskStorage !== null && freeDiskStorage > 0
      ? estimate.estimatedSizeBytes / freeDiskStorage
      : null;
  const freeSpaceLow =
    !exceedsFreeSpace &&
    freeSpaceUsageRatio !== null &&
    freeSpaceUsageRatio >= OfflineMapsService.FREE_SPACE_WARNING_RATIO;

  const initialRegion = useMemo(() => {
    const lastArea = existingAreas?.at(-1);
    return lastArea
      ? GeoUtils.computeRegionFromCoordinates(lastArea.coordinates)
      : GeoUtils.defaultMapRegion;
  }, [existingAreas]);

  const onLayerChange = useCallback((value: string): Promise<void> => {
    setLayerId(value);
    return Promise.resolve();
  }, []);

  const onMapRegionChange = useCallback(() => {
    const updateCurrentZoom = async () => {
      try {
        const camera = await mapRef.current?.getCamera();
        const zoom = camera?.zoom;
        if (typeof zoom === "number") {
          // tiles of the integer zoom level are shown until the next level is reached
          setCurrentZoom(Math.floor(zoom));
        }
      } catch (error) {
        log.debug(`error getting map zoom level: ${String(error)}`);
      }
    };
    void updateCurrentZoom();
  }, []);

  const onCancelDrawing = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const onSaveDrawing = useCallback(
    async (polygon: MapPolygonExtendedProps | null) => {
      if (!polygon || polygon.coordinates.length < 3) return;
      if (nameErrorKey) {
        toaster(nameErrorKey);
        return;
      }
      if (estimate.exceedsMaxTiles) {
        toaster("offlineMaps:areaEditor.tooManyTiles", {
          maxTiles: OfflineMapsService.MAX_TILES_PER_AREA,
        });
        return;
      }
      if (exceedsFreeSpace) {
        toaster("offlineMaps:areaEditor.notEnoughSpace");
        return;
      }
      if (
        freeSpaceLow &&
        !(await confirm({
          titleKey: "offlineMaps:areaEditor.lowSpaceConfirm.title",
          messageKey: "offlineMaps:areaEditor.lowSpaceConfirm.message",
          messageParams: {
            size: Files.toHumanReadableFileSize(estimate.estimatedSizeBytes),
            freeSpace: Files.toHumanReadableFileSize(freeDiskStorage ?? 0),
            percent: Math.floor((freeSpaceUsageRatio ?? 0) * 100),
          },
          confirmButtonTextKey: "offlineMaps:download.label",
        }))
      ) {
        return;
      }
      const area = OfflineMapsService.createArea({
        name: effectiveName,
        layerId,
        coordinates: polygon.coordinates,
        maxZoom: effectiveMaxZoom,
      });
      await downloadArea(area);
      navigation.goBack();
    },
    [
      confirm,
      downloadArea,
      effectiveMaxZoom,
      effectiveName,
      estimate.estimatedSizeBytes,
      estimate.exceedsMaxTiles,
      exceedsFreeSpace,
      freeDiskStorage,
      freeSpaceLow,
      freeSpaceUsageRatio,
      layerId,
      nameErrorKey,
      navigation,
      toaster,
    ],
  );

  const extraOverlays = useMemo(
    () =>
      existingAreas?.map((area) => (
        <Polygon
          key={area.id}
          coordinates={area.coordinates}
          strokeColor={existingAreaStrokeColor}
          fillColor={existingAreaFillColor}
          strokeWidth={1}
          tappable={false}
        />
      )),
    [existingAreas],
  );

  const headerContent = (
    <VView style={styles.header}>
      <TextInput
        error={!!nameErrorKey}
        label="offlineMaps:areaEditor.name"
        onChange={setName}
        value={name}
      />
      {nameErrorKey && (
        <Text style={styles.estimateTextError} textKey={nameErrorKey} />
      )}
      <Dropdown
        items={layerItems}
        label="offlineMaps:areaEditor.layer"
        onChange={onLayerChange}
        value={layerId}
      />
      <HView style={styles.zoomRow}>
        <Text
          style={styles.zoomLabel}
          textKey="offlineMaps:areaEditor.maxZoom"
          textParams={{ value: effectiveMaxZoom }}
        />
        <VView style={styles.zoomSlider}>
          <Slider
            minValue={OfflineMapsService.MIN_SELECTABLE_MAX_ZOOM}
            maxValue={layer.maxZoom}
            step={1}
            value={effectiveMaxZoom}
            onValueChange={setMaxZoom}
          />
        </VView>
        {currentZoom !== null && (
          <Text
            style={styles.zoomLabel}
            textKey="offlineMaps:areaEditor.currentZoom"
            textParams={{ value: currentZoom }}
          />
        )}
      </HView>
      {coordinates.length < 3 ? (
        <Text
          style={styles.estimateText}
          textKey="offlineMaps:areaEditor.drawAreaToEstimate"
        />
      ) : (
        <Text
          textKey="offlineMaps:areaEditor.surface"
          textParams={{ area: GeoUtils.formatArea(areaSquareMeters) }}
        />
      )}
      {coordinates.length >= 3 && (
        <Text
          style={[
            styles.estimateText,
            (estimate.exceedsMaxTiles || exceedsFreeSpace) &&
              styles.estimateTextError,
          ]}
          textKey={
            estimate.exceedsMaxTiles
              ? "offlineMaps:areaEditor.estimateTooManyTiles"
              : "offlineMaps:areaEditor.estimate"
          }
          textParams={{
            tiles: estimate.tilesCount,
            maxTiles: OfflineMapsService.MAX_TILES_PER_AREA,
            size: Files.toHumanReadableFileSize(estimate.estimatedSizeBytes),
            freeSpace:
              freeDiskStorage === null
                ? "-"
                : Files.toHumanReadableFileSize(freeDiskStorage),
          }}
        />
      )}
    </VView>
  );

  if (existingAreas === null) return null;

  return (
    <GeoPolygonEditor
      extraOverlays={extraOverlays}
      headerContent={headerContent}
      initialPolygons={[]}
      initialRegion={initialRegion}
      layerId={layerId}
      mapRef={mapRef}
      onCancelDrawing={onCancelDrawing}
      onCoordinatesChange={setCoordinates}
      onMapRegionChange={onMapRegionChange}
      onSaveDrawing={onSaveDrawing}
      saveButtonIcon="download"
      saveButtonTextKey="offlineMaps:download.label"
    />
  );
};
