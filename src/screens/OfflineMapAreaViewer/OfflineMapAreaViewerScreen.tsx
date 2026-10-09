import { useCallback, useEffect, useMemo, useState } from "react";
import { Keyboard } from "react-native";
import { Polygon } from "react-native-maps";
import { useRoute } from "@react-navigation/native";

import {
  HView,
  IconButton,
  LoadingIcon,
  MapView,
  Text,
  TextInput,
  VView,
} from "components";
import { useTranslation } from "localization";
import { MapLayers, OfflineMapArea } from "model";
import { OfflineMapsService } from "service";
import { GeoUtils, log } from "utils";

import styles from "./styles";

const areaStrokeColor = "rgba(21, 101, 192, 0.95)";
// transparent fill, not to alter the colors of the map tiles being checked
const areaFillColor = "transparent";

export type OfflineMapAreaViewerParams = { areaId: string };

type State = {
  area: OfflineMapArea | null;
  // all the areas (used to validate the name)
  areas: OfflineMapArea[];
  loading: boolean;
  // name being edited
  name: string;
};

export const OfflineMapAreaViewerScreen = () => {
  log.debug("rendering OfflineMapAreaViewerScreen");

  const { t } = useTranslation();
  const route = useRoute();
  const { areaId } = (route.params ??
    {}) as Partial<OfflineMapAreaViewerParams>;

  const [state, setState] = useState<State>({
    area: null,
    areas: [],
    loading: true,
    name: "",
  });
  const { area, areas, loading, name } = state;

  useEffect(() => {
    const loadArea = async () => {
      try {
        const areasLoaded = await OfflineMapsService.fetchAreas();
        const areaLoaded = areasLoaded.find((item) => item.id === areaId);
        setState({
          area: areaLoaded ?? null,
          areas: areasLoaded,
          loading: false,
          name: areaLoaded?.name ?? "",
        });
      } catch (error) {
        log.error("error loading offline map area", error);
        setState({ area: null, areas: [], loading: false, name: "" });
      }
    };
    void loadArea();
  }, [areaId]);

  const initialRegion = useMemo(
    () =>
      area
        ? GeoUtils.computeRegionFromCoordinates(area.coordinates)
        : GeoUtils.defaultMapRegion,
    [area],
  );

  const onNameChange = useCallback((text: string) => {
    setState((prev) => ({ ...prev, name: text }));
  }, []);

  const nameErrorKey = OfflineMapsService.validateAreaName({
    name,
    areas,
    areaId,
  });
  const canSaveName = !!area && !nameErrorKey && name.trim() !== area.name;

  const onSaveNamePress = useCallback(async () => {
    if (!area) return;
    Keyboard.dismiss();
    const areaUpdated = await OfflineMapsService.renameArea({
      areaId: area.id,
      name,
    });
    if (areaUpdated) {
      setState((prev) => ({
        ...prev,
        area: areaUpdated,
        areas: prev.areas.map((item) =>
          item.id === areaUpdated.id ? areaUpdated : item,
        ),
        name: areaUpdated.name,
      }));
    }
  }, [area, name]);

  if (loading) return <LoadingIcon />;

  if (!area) {
    return (
      <Text
        style={styles.notFoundText}
        textKey="offlineMaps:areaViewer.notFound"
      />
    );
  }

  return (
    <VView style={styles.container}>
      <VView style={styles.header}>
        <HView style={styles.nameRow}>
          <TextInput
            error={!!nameErrorKey}
            label="offlineMaps:areaEditor.name"
            onChange={onNameChange}
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
          textKey="offlineMaps:area.layer"
          textParams={{
            layer: MapLayers.getLayerLabel(MapLayers.getLayer(area.layerId), t),
          }}
        />
        <Text
          textKey="offlineMaps:area.surface"
          textParams={{
            area: GeoUtils.formatArea(
              OfflineMapsService.getAreaSquareMeters(area),
            ),
          }}
        />
        <Text
          textKey="offlineMaps:area.zoomLevels"
          textParams={{ minZoom: area.minZoom, maxZoom: area.maxZoom }}
        />
      </VView>
      <MapView
        fitToCoordinatesOnReady={area.coordinates}
        initialRegion={initialRegion}
        layerId={area.layerId}
        style={styles.map}
        toolbarEnabled={false}
      >
        <Polygon
          coordinates={area.coordinates}
          fillColor={areaFillColor}
          strokeColor={areaStrokeColor}
          strokeWidth={2}
          tappable={false}
        />
      </MapView>
    </VView>
  );
};
