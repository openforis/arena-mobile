import {
  MapPolygonExtendedProps,
  PolygonEditor,
} from "@siposdani87/expo-maps-polygon-editor";
import React, { useEffect, useState } from "react";
import { Animated } from "react-native";
import MapView, { Marker } from "react-native-maps";

import {
  Button,
  HView,
  IconButton,
  MapViewWithInitialFit,
  Text,
  View,
  VView,
} from "components";
import { HeartbeatAnimation } from "components/HeartbeatAnimation";

import { GeoPolygonDraftOverlay } from "./GeoPolygonDraftOverlay";
import { GeoPolygonMidpointsOverlay } from "./GeoPolygonMidpointsOverlay";
import { GeoPolygonVerticesOverlay } from "./GeoPolygonVerticesOverlay";
import { useGeoPolygonEditorContent } from "./useGeoPolygonEditorContent";
import styles from "./styles";

type GeoPolygonEditorContentProps = {
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

const currentLocationMarkerAnchor = { x: 0.5, y: 0.5 };

export const GeoPolygonEditorContent = ({
  initialRegion,
  mapRef,
  initialPolygons,
  onCancelDrawing,
  onSaveDrawing,
}: GeoPolygonEditorContentProps) => {
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
    onMidpointDragEnd,
    onPolygonChange,
    onPolygonCreate,
    onPolygonRemove,
    onPolygonSelect,
    onPolygonUnselect,
    onSavePress,
    onUndoPress,
    onVertexPress,
    polygonEditorRef,
    polygonMidpoints,
    polygonsWithSelectionColor,
    polygonVertices,
    selectedVertexIndex,
    currentLocationCoordinate,
    isFollowingCurrentLocation,
    canAddCurrentLocationPoint,
    shouldShowDeleteSelectedPoint,
    strokeColor,
    undoStack,
    visibleCoordinates,
  } = useGeoPolygonEditorContent({
    mapRef,
    initialPolygons,
    onCancelDrawing,
    onSaveDrawing,
  });

  const [locationButtonOpacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (isFollowingCurrentLocation) {
      HeartbeatAnimation({
        value: locationButtonOpacity,
        minValue: 0.25,
        maxValue: 1,
      }).start();
    } else {
      locationButtonOpacity.stopAnimation();
      locationButtonOpacity.setValue(1);
    }
  }, [isFollowingCurrentLocation, locationButtonOpacity]);

  return (
    <VView style={styles.modalContent}>
      <MapViewWithInitialFit
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        onPress={onMapPress}
        onPanDrag={onMapPanDrag}
        fitToCoordinatesOnReady={visibleCoordinates}
        fitOnlyOnce={true}
      >
        {isFollowingCurrentLocation && currentLocationCoordinate && (
          <Marker
            coordinate={currentLocationCoordinate}
            anchor={currentLocationMarkerAnchor}
            tappable={false}
          >
            <View style={styles.currentLocationMarker}>
              <View style={styles.currentLocationMarkerHorizontal} />
              <View style={styles.currentLocationMarkerVertical} />
            </View>
          </Marker>
        )}
        <GeoPolygonDraftOverlay
          coordinates={draftCoordinates}
          fillColor={fillColor}
          strokeColor={strokeColor}
          strokeWidth={newPolygon.strokeWidth}
          showPoints={!hasValue}
        />
        {isPolygonSelected && (
          <GeoPolygonVerticesOverlay
            coordinates={polygonVertices}
            strokeColor={strokeColor}
            selectedVertexIndex={selectedVertexIndex}
            onVertexPress={onVertexPress}
          />
        )}
        {isPolygonSelected && (
          <GeoPolygonMidpointsOverlay
            midpoints={polygonMidpoints}
            strokeColor={strokeColor}
            onMidpointDragEnd={onMidpointDragEnd}
          />
        )}
        <PolygonEditor
          ref={polygonEditorRef}
          newPolygon={newPolygon}
          polygons={polygonsWithSelectionColor}
          onPolygonCreate={onPolygonCreate}
          onPolygonChange={onPolygonChange}
          onPolygonRemove={onPolygonRemove}
          onPolygonSelect={onPolygonSelect}
          onPolygonUnselect={onPolygonUnselect}
          disabled={false}
        />
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
