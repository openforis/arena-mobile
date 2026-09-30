import React, { useEffect } from "react";
import { Animated, StyleProp, ViewStyle } from "react-native";
import RNMapView from "react-native-maps";

import { useHeartbeatAnimation } from "hooks";
import { LatLng, MapLayerId } from "model";
import { log } from "utils";

import { Button } from "../Button";
import { HView } from "../HView";
import { IconButton } from "../IconButton";
import { MapView } from "../MapView";
import { Text } from "../Text";
import { VView } from "../VView";

import { CurrentLocationMarker } from "./CurrentLocationMarker";

import { GeoPolygonDraftOverlay } from "./GeoPolygonDraftOverlay";
import { GeoPolygonMidpointsOverlay } from "./GeoPolygonMidpointsOverlay";
import { GeoPolygonVerticesOverlay } from "./GeoPolygonVerticesOverlay";
import { MapPolygonExtendedProps } from "./polygonEditorUtils";
import { useGeoPolygonEditor } from "./useGeoPolygonEditor";
import styles from "./styles";

type GeoPolygonEditorProps = {
  initialRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  mapRef: React.RefObject<RNMapView | null>;
  initialPolygons: MapPolygonExtendedProps[];
  onCancelDrawing: () => void;
  onSaveDrawing: (polygon: MapPolygonExtendedProps | null) => void;
  // called every time the polygon (or the draft being drawn) changes
  onCoordinatesChange?: (coordinates: LatLng[]) => void;
  // content rendered above the map (e.g. extra form fields)
  headerContent?: React.ReactNode;
  // extra map overlays (e.g. reference polygons)
  extraOverlays?: React.ReactNode;
  // when specified, the given free map layer is used instead of the one in the settings
  layerId?: MapLayerId;
  saveButtonIcon?: string;
  saveButtonTextKey?: string;
  style?: StyleProp<ViewStyle>;
};

export const GeoPolygonEditor = ({
  initialRegion,
  mapRef,
  initialPolygons,
  onCancelDrawing,
  onSaveDrawing,
  onCoordinatesChange,
  headerContent,
  extraOverlays,
  layerId,
  saveButtonIcon = "content-save",
  saveButtonTextKey = "common:save",
  style,
}: GeoPolygonEditorProps) => {
  log.debug(`rendering GeoPolygonEditor`);

  const {
    canSave,
    closeDraftPolygon,
    draftCoordinates,
    fillColor,
    hasValue,
    helperTextKey,
    isPolygonSelected,
    newPolygon,
    onCancelPress,
    onCenterOnLocation,
    onDeleteSelectedVertexPress,
    onMapPress,
    onMapPanDrag,
    onAddCurrentLocationPointPress,
    onMidpointPress,
    onPolygonPress,
    onSavePress,
    onUndoPress,
    onVertexPress,
    onVertexDragStart,
    onVertexDrag,
    onVertexDragEnd,
    polygonMidpoints,
    polygonVertices,
    draggingVertexIndex,
    selectedVertexIndex,
    currentLocationCoordinate,
    isFollowingCurrentLocation,
    canAddCurrentLocationPoint,
    shouldShowDeleteSelectedPoint,
    strokeColor,
    undoStack,
    visibleCoordinates,
  } = useGeoPolygonEditor({
    mapRef,
    initialPolygons,
    onCancelDrawing,
    onSaveDrawing,
  });

  useEffect(() => {
    onCoordinatesChange?.(draftCoordinates);
  }, [draftCoordinates, onCoordinatesChange]);

  const locationButtonOpacity = useHeartbeatAnimation({
    isActive: isFollowingCurrentLocation,
    minValue: 0.25,
    maxValue: 1,
  });

  return (
    <VView style={[styles.modalContent, style]}>
      {headerContent}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        layerId={layerId}
        onPress={onMapPress}
        onPanDrag={onMapPanDrag}
        fitToCoordinatesOnReady={visibleCoordinates}
      >
        {extraOverlays}
        {isFollowingCurrentLocation && currentLocationCoordinate && (
          <CurrentLocationMarker coordinate={currentLocationCoordinate} />
        )}
        <GeoPolygonDraftOverlay
          coordinates={draftCoordinates}
          fillColor={draggingVertexIndex == null ? fillColor : "transparent"}
          strokeColor={strokeColor}
          strokeWidth={newPolygon.strokeWidth}
          showPoints={!hasValue}
          onPolygonPress={onPolygonPress}
        />
        {isPolygonSelected && (
          <GeoPolygonVerticesOverlay
            coordinates={polygonVertices}
            strokeColor={strokeColor}
            selectedVertexIndex={selectedVertexIndex}
            draggingVertexIndex={draggingVertexIndex}
            onVertexPress={onVertexPress}
            onVertexDragStart={onVertexDragStart}
            onVertexDrag={onVertexDrag}
            onVertexDragEnd={onVertexDragEnd}
          />
        )}
        {isPolygonSelected && draggingVertexIndex == null && (
          <GeoPolygonMidpointsOverlay
            midpoints={polygonMidpoints}
            strokeColor={strokeColor}
            onMidpointPress={onMidpointPress}
          />
        )}
      </MapView>

      <Text style={styles.helperText} textKey={helperTextKey} />

      <VView style={styles.toolbar}>
        <HView style={styles.toolbarTopRow}>
          {canAddCurrentLocationPoint && (
            <Button
              compact
              icon="plus"
              mode="contained-tonal"
              onPress={onAddCurrentLocationPointPress}
              textKey="dataEntry:geo.addCurrentLocationPoint"
            />
          )}
          {shouldShowDeleteSelectedPoint && (
            <Button
              color="secondary"
              icon="delete"
              onPress={onDeleteSelectedVertexPress}
              textKey="dataEntry:geo.deleteSelectedPoint"
            />
          )}
        </HView>
        <HView style={styles.toolbarBottomRow}>
          <Animated.View style={{ opacity: locationButtonOpacity }}>
            <IconButton
              avoidMultiplePress={false}
              icon="crosshairs-gps"
              mode={
                isFollowingCurrentLocation ? "contained" : "contained-tonal"
              }
              onPress={onCenterOnLocation}
              size={24}
            />
          </Animated.View>
          <IconButton
            disabled={undoStack.length === 0}
            icon="undo"
            onPress={onUndoPress}
            size={20}
          />
          {hasValue ? (
            <Button
              disabled={!canSave}
              icon={saveButtonIcon}
              onPress={onSavePress}
              textKey={saveButtonTextKey}
            />
          ) : (
            <Button
              disabled={draftCoordinates.length < 3}
              icon="stop"
              onPress={closeDraftPolygon}
              textKey="common:stop"
            />
          )}
          <Button
            color="secondary"
            onPress={onCancelPress}
            textKey="common:cancel"
          />
        </HView>
      </VView>
    </VView>
  );
};
