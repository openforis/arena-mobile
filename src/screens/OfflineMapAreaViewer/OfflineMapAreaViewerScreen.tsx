import { useEffect, useMemo, useState } from "react";
import { Polygon } from "react-native-maps";
import { useRoute } from "@react-navigation/native";

import { LoadingIcon, MapView, Text, VView } from "components";
import { useTranslation } from "localization";
import { OfflineMapArea } from "model";
import { OfflineMapsService } from "service";
import { GeoUtils, log } from "utils";

import styles from "./styles";

const areaStrokeColor = "rgba(21, 101, 192, 0.95)";
// transparent fill, not to alter the colors of the map tiles being checked
const areaFillColor = "transparent";

export type OfflineMapAreaViewerParams = { areaId: string };

type State = {
  area: OfflineMapArea | null;
  loading: boolean;
};

export const OfflineMapAreaViewerScreen = () => {
  log.debug("rendering OfflineMapAreaViewerScreen");

  const { t } = useTranslation();
  const route = useRoute();
  const { areaId } = (route.params ??
    {}) as Partial<OfflineMapAreaViewerParams>;

  const [state, setState] = useState<State>({ area: null, loading: true });
  const { area, loading } = state;

  useEffect(() => {
    const loadArea = async () => {
      try {
        const areaLoaded = areaId
          ? await OfflineMapsService.fetchAreaById(areaId)
          : undefined;
        setState({ area: areaLoaded ?? null, loading: false });
      } catch (error) {
        log.error("error loading offline map area", error);
        setState({ area: null, loading: false });
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
        <Text variant="titleMedium">{area.name}</Text>
        <Text
          textKey="offlineMaps:area.layer"
          textParams={{ layer: t(`offlineMaps:layers.${area.layerId}`) }}
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
