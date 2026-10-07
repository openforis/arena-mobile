import React, { useCallback, useMemo, useRef, useState } from "react";
import RNMapView, { MapPressEvent, Region } from "react-native-maps";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { IconButton, Loader, MapView, Text, VView } from "components";
import { CurrentLocationDot } from "components/MapView/CurrentLocationDot";
import { useCurrentLocationWatch, useToast } from "hooks";
import { useTranslation } from "localization";
import { LatLng, RecordUtils } from "model";
import { RecordService } from "service";
import { DataEntryActions, SurveySelectors, useAppDispatch } from "state";
import { log } from "utils";

import {
  buildCoordinateAttributeFeatures,
  buildSamplingPointFeatures,
  getAvailableLayers,
  getDefaultVisibleLayerKeys,
  getLayerLabel,
  getRecordUuidsBySamplingPointItemUuid,
  RecordsMapLayer,
  RecordsMapLayerType,
  RecordsMapPointFeature,
  RecordsMapPointProperties,
} from "./recordsMapLayers";
import { RecordsMapLayerMarkers } from "./RecordsMapLayerMarkers";
import { RecordsMapLayersPanel } from "./RecordsMapLayersPanel";
import {
  RecordsMapSelection,
  RecordsMapSelectionPanel,
} from "./RecordsMapSelectionPanel";
import styles from "./styles";

type NodeValue = { recordUuid: string; nodeDefUuid: string; value: any };

type DataState = {
  loading: boolean;
  recordSummaries: any[];
  nodeValues: NodeValue[];
};

const worldRegion: Region = {
  latitude: 0,
  longitude: 0,
  latitudeDelta: 140,
  longitudeDelta: 360,
};

const fitEdgePadding = { top: 80, right: 80, bottom: 80, left: 80 };

const toLatLng = (feature: RecordsMapPointFeature): LatLng => {
  const [longitude, latitude] = feature.geometry.coordinates;
  return { latitude, longitude };
};

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
  const navigation = useNavigation();
  const { t } = useTranslation();
  const toaster = useToast();
  const survey = SurveySelectors.useCurrentSurvey()!;
  const cycle = SurveySelectors.useCurrentSurveyCycle()!;
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();
  const srsIndex = SurveySelectors.useCurrentSurveySrsIndex();

  const mapRef = useRef<RNMapView | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [dataState, setDataState] = useState<DataState>({
    loading: true,
    recordSummaries: [],
    nodeValues: [],
  });
  const { loading, recordSummaries, nodeValues } = dataState;
  const [layersPanelVisible, setLayersPanelVisible] = useState(false);
  const [selection, setSelection] = useState<RecordsMapSelection | null>(null);
  const currentLocation = useCurrentLocationWatch();

  const layers = useMemo(
    () => getAvailableLayers({ survey, cycle }),
    [cycle, survey],
  );

  const [visibleLayerKeys, setVisibleLayerKeys] = useState<string[]>(() =>
    getDefaultVisibleLayerKeys({ survey, cycle, layers }),
  );

  const loadData = useCallback(async () => {
    try {
      // local records plus the summaries of the remote ones fetched with the last sync status check
      const _recordSummaries = await RecordService.fetchRecords({
        survey,
        cycle,
        onlyLocal: false,
      });
      const coordinateDefUuids = layers
        .filter((layer) => layer.nodeDefUuid)
        .map((layer) => layer.nodeDefUuid!);
      const _nodeValues = await RecordService.fetchNodeValuesByDefUuids({
        surveyId: survey.id!,
        cycle,
        nodeDefUuids: coordinateDefUuids,
      });
      setDataState({
        loading: false,
        recordSummaries: _recordSummaries,
        nodeValues: _nodeValues,
      });
    } catch (error) {
      setDataState((statePrev) => ({ ...statePrev, loading: false }));
      toaster("recordsMap:errorLoadingData", { details: String(error) });
    }
  }, [cycle, layers, survey, toaster]);

  // (re)load data on focus, e.g. when coming back from the record editor
  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData]),
  );

  const recordSummaryByUuid = useMemo(
    () =>
      recordSummaries.reduce(
        (acc, recordSummary) => {
          acc[recordSummary.uuid] = recordSummary;
          return acc;
        },
        {} as Record<string, any>,
      ),
    [recordSummaries],
  );

  const recordLabelByUuid = useMemo(
    () =>
      recordSummaries.reduce(
        (acc, recordSummary) => {
          const keyValues = RecordUtils.getRecordSummaryValuesByKeyFormatted({
            survey,
            lang,
            recordSummary,
            t,
          });
          acc[recordSummary.uuid] = Object.values(keyValues).join(" - ");
          return acc;
        },
        {} as Record<string, string>,
      ),
    [lang, recordSummaries, survey, t],
  );

  const pointsByLayerKey = useMemo(() => {
    const recordUuidsByItemUuid = getRecordUuidsBySamplingPointItemUuid({
      survey,
      cycle,
      recordSummaries,
    });
    return layers.reduce(
      (acc, layer) => {
        acc[layer.key] =
          layer.type === RecordsMapLayerType.samplingPoints
            ? buildSamplingPointFeatures({
                survey,
                srsIndex,
                layer,
                recordUuidsByItemUuid,
              })
            : buildCoordinateAttributeFeatures({
                srsIndex,
                layer,
                nodeValues,
                recordLabelByUuid,
              });
        return acc;
      },
      {} as Record<string, RecordsMapPointFeature[]>,
    );
  }, [
    cycle,
    layers,
    nodeValues,
    recordLabelByUuid,
    recordSummaries,
    srsIndex,
    survey,
  ]);

  const layerLabelByKey = useMemo(
    () =>
      layers.reduce(
        (acc, layer) => {
          acc[layer.key] = getLayerLabel({ survey, layer, lang, t });
          return acc;
        },
        {} as Record<string, string>,
      ),
    [lang, layers, survey, t],
  );

  const visibleLayers = useMemo(
    () => layers.filter((layer) => visibleLayerKeys.includes(layer.key)),
    [layers, visibleLayerKeys],
  );

  const visibleCoordinates = useMemo(
    () =>
      visibleLayers.flatMap((layer) =>
        (pointsByLayerKey[layer.key] ?? []).map(toLatLng),
      ),
    [pointsByLayerKey, visibleLayers],
  );

  // computed only once, when data is loaded the first time
  const initialRegionRef = useRef<Region | null>(null);
  if (!loading && !initialRegionRef.current) {
    initialRegionRef.current = calculateRegion(visibleCoordinates);
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

  const onLayerToggle = useCallback((layerKey: string) => {
    setVisibleLayerKeys((keysPrev) =>
      keysPrev.includes(layerKey)
        ? keysPrev.filter((key) => key !== layerKey)
        : [...keysPrev, layerKey],
    );
    setSelection(null);
  }, []);

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

  // on iOS the map press event is fired also when pressing a marker
  const onMapPress = useCallback((event: MapPressEvent) => {
    if (event.nativeEvent.action === "marker-press") return;
    setSelection(null);
  }, []);

  const onRecordPress = useCallback(
    (recordUuid: string) => {
      const recordSummary = recordSummaryByUuid[recordUuid];
      if (!recordSummary) return;
      dispatch(
        DataEntryActions.fetchAndEditRecord({ navigation, recordSummary }),
      );
    },
    [dispatch, navigation, recordSummaryByUuid],
  );

  if (loading || !initialRegionRef.current) {
    return <Loader />;
  }

  return (
    <VView style={styles.container}>
      <MapView
        ref={mapRef}
        initialRegion={initialRegionRef.current}
        onMapReady={fitToVisiblePoints}
        onPress={onMapPress}
        onRegionChangeComplete={setRegion}
        style={styles.map}
        toolbarEnabled={false}
      >
        {visibleLayers.map((layer) => (
          <RecordsMapLayerMarkers
            key={layer.key}
            layer={layer}
            onClusterPress={onClusterPress}
            onPointPress={onPointPress}
            points={pointsByLayerKey[layer.key] ?? []}
            region={region ?? initialRegionRef.current}
          />
        ))}
        {currentLocation && (
          <CurrentLocationDot
            accuracy={currentLocation.accuracy}
            coordinate={currentLocation}
          />
        )}
      </MapView>
      <VView style={styles.mapButtons}>
        <IconButton
          icon="map-marker-multiple-outline"
          mode="contained"
          onPress={() => setLayersPanelVisible(true)}
          size={18}
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
      </VView>
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
            label: layerLabelByKey[layer.key]!,
            pointsCount: pointsByLayerKey[layer.key]?.length ?? 0,
          }))}
          onDismiss={() => setLayersPanelVisible(false)}
          onLayerToggle={onLayerToggle}
          visibleLayerKeys={visibleLayerKeys}
        />
      )}
    </VView>
  );
};
