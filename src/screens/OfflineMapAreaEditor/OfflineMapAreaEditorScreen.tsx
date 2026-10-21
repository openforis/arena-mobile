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
import { useTranslation } from "localization";
import { LatLng, MapLayers, OfflineMapArea } from "model";
import { OfflineMapsService } from "service";
import { SettingsSelectors, useConfirm } from "state";
import { Files, GeoUtils, log } from "utils";

import { useOfflineMapAreaDownload } from "../OfflineMaps/useOfflineMapAreaDownload";
import { AreaEditorStep } from "./AreaEditorStep";
import styles from "./styles";

type AreaEditorStepKey = "name" | "layer" | "zoom" | "draw";

const existingAreaStrokeColor = "rgba(96, 96, 96, 0.9)";
const existingAreaFillColor = "rgba(96, 96, 96, 0.15)";

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
  const { t } = useTranslation();

  const layerItems = useMemo(
    () =>
      MapLayers.getPrefetchableLayers().map((item) => ({
        value: item.id,
        label: MapLayers.getLayerLabel(item, t),
      })),
    [t],
  );

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
  const [activeStep, setActiveStep] = useState<AreaEditorStepKey | null>(
    "name",
  );

  const toggleStep = useCallback(
    (step: AreaEditorStepKey) =>
      setActiveStep((prev) => (prev === step ? null : step)),
    [],
  );

  const onCoordinatesChange = useCallback((value: LatLng[]) => {
    setCoordinates(value);
    // drawing on the map moves to the draw step, giving more space to the map
    if (value.length > 0) setActiveStep("draw");
  }, []);

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
        setActiveStep("name");
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
        MapLayers.isCustomLayer(layer) &&
        !(await confirm({
          titleKey: "offlineMaps:areaEditor.customLayerConfirm.title",
          messageKey: "offlineMaps:areaEditor.customLayerConfirm.message",
          messageParams: {
            layer: layer.name,
            tiles: estimate.tilesCount,
          },
          confirmButtonTextKey: "offlineMaps:download.label",
        }))
      ) {
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
      estimate.tilesCount,
      exceedsFreeSpace,
      freeDiskStorage,
      freeSpaceLow,
      freeSpaceUsageRatio,
      layer,
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

  const drawSummary = (() => {
    if (coordinates.length < 3) {
      return t("offlineMaps:areaEditor.steps.drawSummaryEmpty");
    }
    const params = {
      area: GeoUtils.formatArea(areaSquareMeters),
      tiles: estimate.tilesCount,
      maxTiles: OfflineMapsService.MAX_TILES_PER_AREA,
      size: Files.toHumanReadableFileSize(estimate.estimatedSizeBytes),
      freeSpace:
        freeDiskStorage === null
          ? "-"
          : Files.toHumanReadableFileSize(freeDiskStorage),
    };
    return estimate.exceedsMaxTiles
      ? t("offlineMaps:areaEditor.steps.drawSummaryTooManyTiles", params)
      : t("offlineMaps:areaEditor.steps.drawSummary", params);
  })();

  const settingsSummary = [
    effectiveName,
    MapLayers.getLayerLabel(layer, t),
    t("offlineMaps:areaEditor.maxZoom", { value: effectiveMaxZoom }),
  ].join(" · ");

  const headerContent = (
    <VView style={styles.header}>
      {activeStep === "draw" ? (
        // while drawing, steps 1-3 are merged into a single row to leave more space to the map
        <AreaEditorStep
          badgeText="1-3"
          collapsible
          completed
          expanded={false}
          index={0}
          onPress={() => setActiveStep(null)}
          summary={settingsSummary}
          summaryIsError={!!nameErrorKey}
          summaryOnly
        />
      ) : (
        <>
          <AreaEditorStep
            completed
            expanded={activeStep === "name"}
            index={0}
            onNextPress={() => setActiveStep("layer")}
            onPress={() => toggleStep("name")}
            summary={effectiveName}
            summaryIsError={!!nameErrorKey}
            titleKey="offlineMaps:areaEditor.steps.name"
          >
            <TextInput
              error={!!nameErrorKey}
              label="offlineMaps:areaEditor.name"
              onChange={setName}
              value={name}
            />
            {nameErrorKey && (
              <Text style={styles.estimateTextError} textKey={nameErrorKey} />
            )}
          </AreaEditorStep>
          <AreaEditorStep
            completed
            expanded={activeStep === "layer"}
            index={1}
            onNextPress={() => setActiveStep("zoom")}
            onPress={() => toggleStep("layer")}
            summary={MapLayers.getLayerLabel(layer, t)}
            titleKey="offlineMaps:areaEditor.steps.layer"
          >
            <Dropdown
              items={layerItems}
              translateItemLabels={false}
              label="offlineMaps:areaEditor.layer"
              onChange={onLayerChange}
              value={layerId}
            />
          </AreaEditorStep>
          <AreaEditorStep
            completed
            expanded={activeStep === "zoom"}
            index={2}
            onNextPress={() => setActiveStep("draw")}
            onPress={() => toggleStep("zoom")}
            summary={t("offlineMaps:areaEditor.maxZoom", {
              value: effectiveMaxZoom,
            })}
            titleKey="offlineMaps:areaEditor.steps.zoom"
          >
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
            </HView>
            {currentZoom !== null && (
              <Text
                style={styles.zoomLabel}
                textKey="offlineMaps:areaEditor.currentZoom"
                textParams={{ value: currentZoom }}
              />
            )}
            <Text
              style={styles.stepHint}
              textKey="offlineMaps:areaEditor.steps.zoomHint"
              variant="bodySmall"
            />
          </AreaEditorStep>
        </>
      )}
      <AreaEditorStep
        completed={coordinates.length >= 3}
        expanded={activeStep === "draw"}
        index={3}
        onPress={() => setActiveStep("draw")}
        summary={drawSummary}
        summaryIsError={estimate.exceedsMaxTiles || exceedsFreeSpace}
        summaryOnly
        titleKey="offlineMaps:areaEditor.steps.draw"
      />
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
      onCoordinatesChange={onCoordinatesChange}
      onMapRegionChange={onMapRegionChange}
      onSaveDrawing={onSaveDrawing}
      compact
      saveButtonIcon="download"
      saveButtonTextKey="offlineMaps:download.label"
    />
  );
};
