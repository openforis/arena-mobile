import React from "react";
import { Animated } from "react-native";
import MapView from "react-native-maps";

import { useHeartbeatAnimation } from "hooks";

import { Button } from "../Button";
import { HView } from "../HView";
import { IconButton } from "../IconButton";
import { MapViewWithInitialFit } from "../MapViewWithInitialFit";
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
  mapRef: React.RefObject<MapView | null>;
  initialPolygons: MapPolygonExtendedProps[];
  onCancelDrawing: () => void;
  onSaveDrawing: (polygon: MapPolygonExtendedProps | null) => void;
};

export const GeoPolygonEditor = ({
  initialRegion,
  mapRef,
  initialPolygons,
  onCancelDrawing,
  onSaveDrawing,
}: GeoPolygonEditorProps) => {
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

  const locationButtonOpacity = useHeartbeatAnimation({
    isActive: isFollowingCurrentLocation,
    minValue: 0.25,
    maxValue: 1,
  });

  return (
    <VView style={styles.modalContent}>
      <MapViewWithInitialFit
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        onPress={onMapPress}
        onPanDrag={onMapPanDrag}
        fitToCoordinatesOnReady={visibleCoordinates}
      >
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
      </MapViewWithInitialFit>

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
              icon="content-save"
              onPress={onSavePress}
              textKey="common:save"
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
