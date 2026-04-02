import React from "react";
import {
  MapPolygonExtendedProps,
  PolygonEditor,
} from "@siposdani87/expo-maps-polygon-editor";
import MapView from "react-native-maps";

import {
  Button,
  HView,
  IconButton,
  MapViewWithInitialFit,
  Text,
  VView,
} from "components";

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

  return (
    <VView style={styles.modalContent}>
      <MapViewWithInitialFit
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        onPress={onMapPress}
        fitToCoordinatesOnReady={visibleCoordinates}
        fitOnlyOnce={true}
      >
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
          <IconButton
            icon="crosshairs-gps"
            onPress={onCenterOnLocation}
            size={24}
          />
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
