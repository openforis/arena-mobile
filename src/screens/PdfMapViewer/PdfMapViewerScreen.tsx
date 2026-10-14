import { useCallback, useEffect, useMemo, useState } from "react";
import { Keyboard } from "react-native";
import { Polygon } from "react-native-maps";
import { useRoute } from "@react-navigation/native";

import {
  HView,
  IconButton,
  MapView,
  Switch,
  Text,
  TextInput,
  VView,
} from "components";
import { PdfMapsService } from "service";
import { SettingsActions, SettingsSelectors, useAppDispatch } from "state";
import { GeoUtils, log } from "utils";

import styles from "./styles";

const neatlineStrokeColor = "rgba(21, 101, 192, 0.95)";

export type PdfMapViewerParams = { mapId: string };

export const PdfMapViewerScreen = () => {
  log.debug("rendering PdfMapViewerScreen");

  const route = useRoute();
  const { mapId } = (route.params ?? {}) as Partial<PdfMapViewerParams>;
  const dispatch = useAppDispatch();
  const settings = SettingsSelectors.useSettings();
  const pdfMaps = useMemo(() => settings.pdfMaps ?? [], [settings.pdfMaps]);
  const pdfMap = pdfMaps.find((item) => item.id === mapId);

  const [name, setName] = useState(pdfMap?.name ?? "");
  const [baseMapHidden, setBaseMapHidden] = useState(false);

  useEffect(() => {
    if (pdfMap) setName(pdfMap.name);
  }, [pdfMap]);

  const pdfMapIds = useMemo(() => (mapId ? [mapId] : []), [mapId]);

  const initialRegion = useMemo(
    () =>
      pdfMap
        ? GeoUtils.computeRegionFromCoordinates(pdfMap.neatline)
        : GeoUtils.defaultMapRegion,
    [pdfMap],
  );

  const nameErrorKey = PdfMapsService.validateName({
    name,
    pdfMaps,
    ...(mapId ? { mapId } : {}),
  });
  const canSaveName = !!pdfMap && !nameErrorKey && name.trim() !== pdfMap.name;

  const onSaveNamePress = useCallback(async () => {
    if (!mapId) return;
    Keyboard.dismiss();
    await dispatch(SettingsActions.updatePdfMap({ mapId, changes: { name } }));
  }, [dispatch, mapId, name]);

  if (!pdfMap) {
    return <Text style={styles.notFoundText} textKey="pdfMaps:map.notFound" />;
  }

  return (
    <VView style={styles.container}>
      <VView style={styles.header}>
        <HView style={styles.nameRow}>
          <TextInput
            error={!!nameErrorKey}
            label="pdfMaps:import.name"
            onChange={setName}
            style={styles.nameInput}
            value={name}
          />
          <IconButton
            disabled={!canSaveName}
            icon="content-save"
            onPress={onSaveNamePress}
          />
        </HView>
        {nameErrorKey && (
          <Text style={styles.nameError} textKey={nameErrorKey} />
        )}
        <Text
          textKey="pdfMaps:map.fileName"
          textParams={{ fileName: pdfMap.fileName }}
        />
        <Text
          textKey="pdfMaps:map.zoomLevels"
          textParams={{ minZoom: pdfMap.minZoom, maxZoom: pdfMap.maxZoom }}
        />
        {!pdfMap.datumCompatible && (
          <Text style={styles.warningText} textKey="pdfMaps:map.datumWarning" />
        )}
        <HView style={styles.baseMapRow}>
          <Text textKey="pdfMaps:hideBaseMap" />
          <Switch onChange={setBaseMapHidden} value={baseMapHidden} />
        </HView>
      </VView>
      <MapView
        baseMapHidden={baseMapHidden}
        fitToCoordinatesOnReady={pdfMap.neatline}
        initialRegion={initialRegion}
        pdfMapIds={pdfMapIds}
        showZoomControls
        style={styles.map}
        toolbarEnabled={false}
      >
        <Polygon
          coordinates={pdfMap.neatline}
          fillColor="transparent"
          strokeColor={neatlineStrokeColor}
          strokeWidth={2}
          tappable={false}
        />
      </MapView>
    </VView>
  );
};
