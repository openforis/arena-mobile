import { useCallback, useMemo, useState } from "react";
import { Keyboard } from "react-native";
import { Polygon } from "react-native-maps";
import { useScreenParams } from "navigation/navigator";
import { screenKeys } from "screens/screenKeys";

import { HView, MapView, Switch, Text, VView } from "components";
import { ImportedMapsService } from "service";
import { SettingsActions, SettingsSelectors, useAppDispatch } from "state";
import { GeoUtils, log } from "utils";

import { canSaveMapName } from "../OfflineMaps/mapNameUtils";
import { MapNameEditHeader } from "../OfflineMaps/MapNameEditHeader";
import styles from "./styles";

const neatlineStrokeColor = "rgba(21, 101, 192, 0.95)";

export type ImportedMapViewerParams = { mapId: string };

export const ImportedMapViewerScreen = () => {
  log.debug("rendering ImportedMapViewerScreen");

  const { mapId } = useScreenParams<screenKeys.importedMapViewer>();
  const dispatch = useAppDispatch();
  const settings = SettingsSelectors.useSettings();
  const importedMaps = useMemo(
    () => settings.importedMaps ?? [],
    [settings.importedMaps],
  );
  const importedMap = importedMaps.find((item) => item.id === mapId);

  const [name, setName] = useState(importedMap?.name ?? "");
  const [baseMapHidden, setBaseMapHidden] = useState(false);
  const [currentZoom, setCurrentZoom] = useState<number | null>(null);

  const [prevImportedMap, setPrevImportedMap] = useState(importedMap);
  if (importedMap !== prevImportedMap) {
    setPrevImportedMap(importedMap);
    if (importedMap) setName(importedMap.name);
  }

  const importedMapIds = useMemo(() => (mapId ? [mapId] : []), [mapId]);

  const initialRegion = useMemo(
    () =>
      importedMap
        ? GeoUtils.computeRegionFromCoordinates(importedMap.neatline)
        : GeoUtils.defaultMapRegion,
    [importedMap],
  );

  const nameErrorKey = ImportedMapsService.validateName({
    name,
    importedMaps,
    ...(mapId ? { mapId } : {}),
  });
  const canSaveName = canSaveMapName({
    name,
    savedName: importedMap?.name,
    nameErrorKey,
  });

  const onSaveNamePress = useCallback(async () => {
    if (!mapId) return;
    Keyboard.dismiss();
    await dispatch(
      SettingsActions.updateImportedMap({ mapId, changes: { name } }),
    );
  }, [dispatch, mapId, name]);

  if (!importedMap) {
    return (
      <Text style={styles.notFoundText} textKey="importedMaps:map.notFound" />
    );
  }

  return (
    <VView style={styles.container}>
      <MapNameEditHeader
        canSave={canSaveName}
        label="importedMaps:import.name"
        name={name}
        nameErrorKey={nameErrorKey}
        onNameChange={setName}
        onSavePress={onSaveNamePress}
      >
        <Text
          textKey="importedMaps:map.fileName"
          textParams={{ fileName: importedMap.fileName }}
        />
        <Text
          textKey="importedMaps:map.zoomLevels"
          textParams={{
            minZoom: importedMap.minZoom,
            maxZoom: importedMap.maxZoom,
          }}
        />
        {currentZoom !== null && (
          <Text
            textKey="offlineMaps:areaEditor.currentZoom"
            textParams={{ value: currentZoom }}
          />
        )}
        {!importedMap.datumCompatible && (
          <Text
            style={styles.warningText}
            textKey="importedMaps:map.datumWarning"
          />
        )}
        <HView style={styles.baseMapRow}>
          <Text textKey="importedMaps:hideBaseMap" />
          <Switch onChange={setBaseMapHidden} value={baseMapHidden} />
        </HView>
      </MapNameEditHeader>
      <MapView
        baseMapHidden={baseMapHidden}
        fitToCoordinatesOnReady={importedMap.neatline}
        initialRegion={initialRegion}
        importedMapIds={importedMapIds}
        // tiles of the integer zoom level are shown until the next level is reached
        onZoomChange={(zoom) => setCurrentZoom(Math.floor(zoom))}
        style={styles.map}
        toolbarEnabled={false}
      >
        <Polygon
          coordinates={importedMap.neatline}
          fillColor="transparent"
          strokeColor={neatlineStrokeColor}
          strokeWidth={2}
          tappable={false}
        />
      </MapView>
    </VView>
  );
};
