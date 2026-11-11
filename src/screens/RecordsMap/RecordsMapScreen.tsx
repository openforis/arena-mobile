import { useCallback, useRef, useState } from "react";
import RNMapView, {
  MapPressEvent,
  Polygon,
  Polyline,
  Region,
} from "react-native-maps";

import { useNavigator, useScreenParams } from "navigation/navigator";
import { screenKeys } from "screens/screenKeys";
import { IconButton, Loader, MapView, Text, VView } from "components";
import { CurrentLocationDot } from "components/MapView/CurrentLocationDot";
import { useCurrentLocationWatch } from "hooks";
import { useTranslation } from "localization";
import { LatLng, MapProvider } from "model";
import { DataEntryActions, SurveySelectors, useAppDispatch } from "state";
import { log } from "utils";

import {
  getLayerLabel,
  RecordsMapLayer,
  RecordsMapLayerType,
  RecordsMapPointProperties,
  RecordsMapTrackFeature,
} from "./recordsMapLayers";
import { RecordsMapLayerMarkers } from "./RecordsMapLayerMarkers";
import { RecordsMapLayersPanel } from "./RecordsMapLayersPanel";
import {
  RecordsMapSelection,
  RecordsMapSelectionPanel,
} from "./RecordsMapSelectionPanel";
import styles from "./styles";
import { useRecordsMapData } from "./useRecordsMapData";

export type RecordsMapParams = {
  // map provider chosen when opening the map (the one in the settings, if not specified)
  mapProvider?: MapProvider;
};

const worldRegion: Region = {
  latitude: 0,
  longitude: 0,
  latitudeDelta: 140,
  longitudeDelta: 360,
};

const fitEdgePadding = { top: 80, right: 80, bottom: 80, left: 80 };

// on iOS the map press event is fired also right after a track (polyline) press
const TRACK_PRESS_MAP_PRESS_IGNORE_MS = 500;

// region including all the given points (used only as initial region, refined by fitToCoordinates)
const calculateRegion = (coordinates: LatLng[]): Region => {
  if (coordinates.length === 0) return worldRegion;
  const latitudes = coordinates.map((c) => c.latitude);
  const longitudes = coordinates.map((c) => c.longitude);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.2, 0.005),
    longitudeDelta: Math.max((maxLng - minLng) * 1.2, 0.005),
  };
};

export const RecordsMapScreen = () => {
  log.debug("rendering RecordsMapScreen");

  const dispatch = useAppDispatch();
  const navigator = useNavigator();
  const { mapProvider } = useScreenParams<screenKeys.recordsMap>();
  const { t } = useTranslation();
  const survey = SurveySelectors.useCurrentSurvey()!;
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();

  const mapRef = useRef<RNMapView | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [layersPanelVisible, setLayersPanelVisible] = useState(false);
  const [selection, setSelection] = useState<RecordsMapSelection | null>(null);
  const currentLocation = useCurrentLocationWatch();

  const {
    loading,
    layers,
    visibleLayers,
    visibleLayerKeys,
    toggleLayer,
    recordSummaryByUuid,
    recordLabelByUuid,
    layerLabelByKey,
    pointsByLayerKey,
    tracksByLayerKey,
    areaPolygonsByLayerKey,
    preloadedShapesByLayerKey,
    visibleCoordinates,
  } = useRecordsMapData();

  // computed only once, when data is loaded the first time
  const [initialRegion, setInitialRegion] = useState<Region | null>(null);
  if (!loading && !initialRegion) {
    setInitialRegion(calculateRegion(visibleCoordinates));
  }

  const fitToVisiblePoints = useCallback(() => {
    if (visibleCoordinates.length === 0) return;
    mapRef.current?.fitToCoordinates(visibleCoordinates, {
      edgePadding: fitEdgePadding,
      animated: true,
    });
  }, [visibleCoordinates]);

  const onCurrentLocationPress = useCallback(() => {
    if (!currentLocation) return;
    mapRef.current?.animateToRegion({
      ...currentLocation,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    });
  }, [currentLocation]);

  const onLayerToggle = useCallback(
    (layerKey: string) => {
      toggleLayer(layerKey);
      setSelection(null);
    },
    [toggleLayer],
  );

  const onPointPress = useCallback(
    ({
      layer,
      points,
    }: {
      layer: RecordsMapLayer;
      points: RecordsMapPointProperties[];
    }) => {
      setSelection({
        layerLabel: layerLabelByKey[layer.key]!,
        layerType: layer.type,
        points,
      });
    },
    [layerLabelByKey],
  );

  const onClusterPress = useCallback(
    ({
      layer,
      expansionRegion,
      leaves,
    }: {
      layer: RecordsMapLayer;
      expansionRegion: Region;
      leaves: RecordsMapPointProperties[];
    }) => {
      // points too close to be split (e.g. same location): show them all
      const currentLongitudeDelta = region?.longitudeDelta ?? Infinity;
      if (expansionRegion.longitudeDelta >= currentLongitudeDelta * 0.9) {
        onPointPress({ layer, points: leaves });
      } else {
        mapRef.current?.animateToRegion(expansionRegion);
      }
    },
    [onPointPress, region?.longitudeDelta],
  );

  const lastTrackPressTimeRef = useRef(0);

  const onTrackPress = useCallback(
    (layer: RecordsMapLayer, track: RecordsMapTrackFeature) => {
      lastTrackPressTimeRef.current = Date.now();
      setSelection({
        layerLabel: layerLabelByKey[layer.key]!,
        layerType: layer.type,
        points: [
          {
            key: track.key,
            layerKey: track.layerKey,
            label: track.label,
            recordUuids: [track.recordUuid],
            point: track.point,
          },
        ],
      });
    },
    [layerLabelByKey],
  );

  // on iOS the map press event is fired also when pressing a marker
  const onMapPress = useCallback((event: MapPressEvent) => {
    if (event.nativeEvent.action === "marker-press") return;
    if (
      Date.now() - lastTrackPressTimeRef.current <
      TRACK_PRESS_MAP_PRESS_IGNORE_MS
    )
      return;
    setSelection(null);
  }, []);

  const onRecordPress = useCallback(
    (recordUuid: string) => {
      const recordSummary = recordSummaryByUuid[recordUuid];
      if (!recordSummary) return;
      dispatch(
        DataEntryActions.fetchAndEditRecord({ navigator, recordSummary }),
      );
    },
    [dispatch, navigator, recordSummaryByUuid],
  );

  const getLayerItemsCount = (layer: RecordsMapLayer): number | null => {
    switch (layer.type) {
      case RecordsMapLayerType.positionTrack:
        return tracksByLayerKey[layer.key]?.length ?? null;
      // points, lines and polygons: not counted
      case RecordsMapLayerType.preloadedMapLayer:
        return null;
      default:
        return pointsByLayerKey[layer.key]?.length ?? null;
    }
  };

  if (loading || !initialRegion) {
    return <Loader />;
  }

  return (
    <VView style={styles.container}>
      <MapView
        ref={mapRef}
        extraButtons={
          <>
            <IconButton
              icon="map-marker-multiple-outline"
              mode="contained"
              onPress={() => setLayersPanelVisible(true)}
              size={18}
              testID="records-map-layers-button"
            />
            <IconButton
              disabled={visibleCoordinates.length === 0}
              icon="fit-to-screen-outline"
              mode="contained"
              onPress={fitToVisiblePoints}
              size={18}
            />
            <IconButton
              disabled={!currentLocation}
              icon="crosshairs-gps"
              mode="contained"
              onPress={onCurrentLocationPress}
              size={18}
            />
          </>
        }
        initialRegion={initialRegion}
        onMapReady={fitToVisiblePoints}
        onPress={onMapPress}
        onRegionChangeComplete={setRegion}
        provider={mapProvider}
        style={styles.map}
        toolbarEnabled={false}
      >
        {/* areas first: below tracks and markers */}
        {visibleLayers.flatMap((layer) =>
          (areaPolygonsByLayerKey[layer.key] ?? []).map((polygon) => (
            <Polygon
              key={polygon.key}
              coordinates={polygon.coordinates}
              fillColor={`${layer.color}33`}
              holes={polygon.holes}
              strokeColor={layer.color}
              strokeWidth={2}
              tappable={false}
            />
          )),
        )}
        {visibleLayers.flatMap((layer) =>
          (preloadedShapesByLayerKey[layer.key]?.lines ?? []).map((line) => (
            <Polyline
              key={line.key}
              coordinates={line.coordinates}
              strokeColor={layer.color}
              strokeWidth={2}
              tappable={false}
            />
          )),
        )}
        {visibleLayers.flatMap((layer) =>
          (tracksByLayerKey[layer.key] ?? []).flatMap((track) =>
            track.lines.map((line, lineIndex) => (
              <Polyline
                key={`${track.key}_${lineIndex}`}
                coordinates={line}
                onPress={() => onTrackPress(layer, track)}
                strokeColor={layer.color}
                strokeWidth={4}
                tappable
              />
            )),
          ),
        )}
        {visibleLayers.map((layer) => (
          <RecordsMapLayerMarkers
            key={layer.key}
            layer={layer}
            onClusterPress={onClusterPress}
            onPointPress={onPointPress}
            points={pointsByLayerKey[layer.key] ?? []}
            region={region ?? initialRegion}
          />
        ))}
        {currentLocation && (
          <CurrentLocationDot
            accuracy={currentLocation.accuracy}
            coordinate={currentLocation}
          />
        )}
      </MapView>
      {layers.length === 0 && (
        <Text style={styles.emptyMessage} textKey="recordsMap:noLayers" />
      )}
      {selection && (
        <RecordsMapSelectionPanel
          onDismiss={() => setSelection(null)}
          onRecordPress={onRecordPress}
          recordLabelByUuid={recordLabelByUuid}
          selection={selection}
        />
      )}
      {layersPanelVisible && (
        <RecordsMapLayersPanel
          layerItems={layers.map((layer) => ({
            layer,
            label: getLayerLabel({ survey, layer, lang, t, inGroup: true }),
            pointsCount: getLayerItemsCount(layer),
          }))}
          onDismiss={() => setLayersPanelVisible(false)}
          onLayerToggle={onLayerToggle}
          visibleLayerKeys={visibleLayerKeys}
        />
      )}
    </VView>
  );
};
