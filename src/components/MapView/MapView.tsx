import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { LayoutChangeEvent, StyleProp, View, ViewStyle } from "react-native";
import RNMapView, {
  MapPressEvent,
  MapType,
  PanDragEvent,
  PoiClickEvent,
  Region,
  UrlTile,
} from "react-native-maps";

import { useIsNetworkConnected } from "hooks/useIsNetworkConnected";
import { useTranslation } from "localization";
import { LatLng, MapLayers, MapProvider } from "model";
import { OfflineMapTilesStorage } from "service/offlineMaps/offlineMapTilesStorage";
import { SettingsSelectors } from "state/settings/selectors";
import { Environment } from "utils";

import { IconButton } from "../IconButton";
import { Text } from "../Text";
import styles from "./styles";

type EdgePadding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

type FitToCoordinatesOptions = {
  edgePadding?: EdgePadding;
  animated?: boolean;
};

type Props = {
  children?: React.ReactNode;
  fitToCoordinatesOnReady?: LatLng[];
  fitToCoordinatesOptions?: FitToCoordinatesOptions;
  fitOnlyOnce?: boolean;
  initialRegion: Region;
  // when specified, the given free map layer is used, ignoring the map provider in the settings
  layerId?: string;
  onMapReady?: () => void;
  onPanDrag?: (event: PanDragEvent) => void;
  // called (instead of onPress) when a point of interest of the base map is pressed
  onPoiClick?: (event: PoiClickEvent) => void;
  onPress?: (event: MapPressEvent) => void;
  onRegionChangeComplete?: (region: Region) => void;
  showMapTypeSelector?: boolean;
  style?: StyleProp<ViewStyle>;
  toolbarEnabled?: boolean;
};

const defaultEdgePadding: EdgePadding = {
  top: 24,
  right: 24,
  bottom: 24,
  left: 24,
};

const mapTypes: MapType[] = ["standard", "satellite", "hybrid"];

// pre-fetched tiles must not expire: they would be re-downloaded in background when online
const TILE_CACHE_MAX_AGE_SECONDS = 365 * 24 * 60 * 60;

// time the name of the layer is shown after switching layer
const LAYER_NAME_VISIBILITY_MILLIS = 1500;

const getNextItem = <T,>(items: T[], current: T): T => {
  const currentIndex = items.indexOf(current);
  const nextIndex = (currentIndex + 1) % items.length;
  return items[nextIndex] ?? items[0]!;
};

export const MapView = forwardRef<RNMapView | null, Props>(
  (
    {
      children,
      fitOnlyOnce = true,
      fitToCoordinatesOnReady,
      fitToCoordinatesOptions,
      layerId: layerIdProp,
      onMapReady,
      onRegionChangeComplete,
      showMapTypeSelector = true,
      style,
      initialRegion,
      onPress,
      onPanDrag,
      onPoiClick,
      toolbarEnabled,
    },
    ref,
  ) => {
    const internalRef = useRef<RNMapView | null>(null);
    const [isMapReady, setIsMapReady] = useState(false);
    const hasAppliedFitRef = useRef(false);
    const [mapType, setMapType] = useState<MapType>("standard");

    const { t } = useTranslation();
    const settings = SettingsSelectors.useSettings();
    const useFreeLayers =
      !!layerIdProp || settings.mapProvider === MapProvider.freeLayers;
    const [selectedLayerId, setSelectedLayerId] = useState<string>(
      () => layerIdProp ?? settings.mapLayer,
    );
    const layer = MapLayers.getLayer(layerIdProp ?? selectedLayerId);
    const hasAttribution = !!layer.attribution;
    const [attributionHeight, setAttributionHeight] = useState(0);
    const [layerNameVisible, setLayerNameVisible] = useState(false);
    const layerNameTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
      null,
    );
    const networkConnected = useIsNetworkConnected();
    const offlineMode = !networkConnected;

    useImperativeHandle<RNMapView | null, RNMapView | null>(
      ref,
      () => internalRef.current,
    );

    useEffect(() => {
      if (!isMapReady || (fitOnlyOnce && hasAppliedFitRef.current)) return;
      if (!fitToCoordinatesOnReady || fitToCoordinatesOnReady.length < 3)
        return;

      internalRef.current?.fitToCoordinates(fitToCoordinatesOnReady, {
        edgePadding: fitToCoordinatesOptions?.edgePadding ?? defaultEdgePadding,
        animated: fitToCoordinatesOptions?.animated ?? false,
      });

      if (fitOnlyOnce) {
        hasAppliedFitRef.current = true;
      }
    }, [
      fitOnlyOnce,
      fitToCoordinatesOnReady,
      fitToCoordinatesOptions?.animated,
      fitToCoordinatesOptions?.edgePadding,
      isMapReady,
    ]);

    const onAttributionLayout = useCallback((event: LayoutChangeEvent) => {
      setAttributionHeight(Math.ceil(event.nativeEvent.layout.height));
    }, []);

    // the layer attribution is shown at the bottom of the map: the padding moves the logo
    // of the native map (Google/Apple) above it, so that it is not covered;
    // the padding must be set only when the map is ready (on Android it throws an error otherwise)
    const mapPadding = useMemo(
      () =>
        isMapReady && useFreeLayers && hasAttribution && attributionHeight > 0
          ? { top: 0, right: 0, bottom: attributionHeight, left: 0 }
          : undefined,
      [attributionHeight, hasAttribution, isMapReady, useFreeLayers],
    );

    const onMapReadyCallback = useCallback(() => {
      setIsMapReady(true);
      onMapReady?.();
    }, [onMapReady]);

    // shows the name of the layer just selected for a short time
    const showLayerName = useCallback(() => {
      if (layerNameTimeoutRef.current) {
        clearTimeout(layerNameTimeoutRef.current);
      }
      setLayerNameVisible(true);
      layerNameTimeoutRef.current = setTimeout(() => {
        layerNameTimeoutRef.current = null;
        setLayerNameVisible(false);
      }, LAYER_NAME_VISIBILITY_MILLIS);
    }, []);

    useEffect(
      () => () => {
        if (layerNameTimeoutRef.current) {
          clearTimeout(layerNameTimeoutRef.current);
        }
      },
      [],
    );

    const handleMapTypeChange = useCallback(() => {
      showLayerName();
      if (useFreeLayers) {
        setSelectedLayerId((prevLayerId) =>
          getNextItem(
            MapLayers.getLayers().map((l) => l.id),
            prevLayerId,
          ),
        );
      } else {
        setMapType((prevMapType) => getNextItem(mapTypes, prevMapType));
      }
    }, [showLayerName, useFreeLayers]);

    const layerName = useFreeLayers
      ? MapLayers.getLayerLabel(layer, t)
      : t(`offlineMaps:mapTypes.${mapType}`);

    // on Android the Google base map is hidden (mapType "none"); on iOS the UrlTile replaces the Apple map content
    const effectiveMapType: MapType =
      useFreeLayers && Environment.isAndroid ? "none" : mapType;

    return (
      <View style={styles.container}>
        <RNMapView
          ref={internalRef}
          style={style}
          initialRegion={initialRegion}
          onPress={onPress}
          onPanDrag={onPanDrag}
          onPoiClick={onPoiClick}
          onMapReady={onMapReadyCallback}
          onRegionChangeComplete={onRegionChangeComplete}
          mapPadding={mapPadding}
          mapType={effectiveMapType}
          toolbarEnabled={toolbarEnabled}
        >
          {useFreeLayers && (
            <UrlTile
              // remount the tile overlay when the layer or the network status change
              key={`${layer.id}_${offlineMode}`}
              urlTemplate={layer.urlTemplate}
              minimumZ={layer.minZoom}
              maximumZ={layer.maxZoom}
              maximumNativeZ={layer.maxZoom}
              offlineMode={offlineMode}
              shouldReplaceMapContent
              tileCacheMaxAge={TILE_CACHE_MAX_AGE_SECONDS}
              tileCachePath={OfflineMapTilesStorage.getLayerTileCachePath(
                layer.id,
              )}
              zIndex={-1}
            />
          )}
          {children}
        </RNMapView>
        {useFreeLayers && hasAttribution && (
          <View
            onLayout={onAttributionLayout}
            pointerEvents="none"
            style={styles.attribution}
          >
            <Text style={styles.attributionText} numberOfLines={2}>
              {layer.attribution}
            </Text>
          </View>
        )}
        {useFreeLayers && offlineMode && (
          <View style={styles.offlineBadge} pointerEvents="none">
            <Text
              style={styles.offlineBadgeText}
              textKey="offlineMaps:offlineMode"
            />
          </View>
        )}
        {layerNameVisible && (
          <View style={styles.layerNameContainer} pointerEvents="none">
            <Text style={styles.layerName}>{layerName}</Text>
          </View>
        )}
        {showMapTypeSelector && !layerIdProp && (
          <View style={styles.mapTypeSelector}>
            <IconButton
              icon="layers-outline"
              mode="contained"
              onPress={handleMapTypeChange}
              size={18}
            />
          </View>
        )}
      </View>
    );
  },
);

MapView.displayName = "MapViewWithInitialFit";
