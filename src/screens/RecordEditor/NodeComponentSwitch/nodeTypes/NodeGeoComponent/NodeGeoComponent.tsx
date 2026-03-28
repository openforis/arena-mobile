import React, { useEffect, useMemo } from "react";
import { View as RNView } from "react-native";

import { PolygonEditor } from "@siposdani87/expo-maps-polygon-editor";
import { Marker, Polygon as MapPolygon, Polyline } from "react-native-maps";

import {
  Button,
  HView,
  IconButton,
  MapViewWithInitialFit,
  Modal,
  Text,
  VView,
} from "components";

import { NodeComponentProps } from "../nodeComponentPropTypes";
import { useNodeGeoComponent } from "./useNodeGeoComponent";
import styles from "./styles";

export const NodeGeoComponent = (props: NodeComponentProps) => {
  const {
    draftCoordinates,
    editable,
    initialRegion,
    mapRef,
    newPolygon,
    onMapPress,
    polygonEditorRef,
    polygons,
    onCancelDrawing,
    onCenterOnLocation,
    onClearPress,
    onPolygonChange,
    onPolygonCreate,
    onPolygonRemove,
    onStartDrawing,
  } = useNodeGeoComponent(props);

  const hasValue = polygons.length > 0;

  const visibleCoordinates = useMemo(
    () => (hasValue ? (polygons[0]?.coordinates ?? []) : draftCoordinates),
    [draftCoordinates, hasValue, polygons],
  );

  const isDrawingPolygon = editable;
  const isEditingExistingPolygon = editable && hasValue;

  useEffect(() => {
    if (!isEditingExistingPolygon) return;

    // The editor remounts inside the modal; reselect the polygon to enable
    // vertex handles for drag editing.
    const timeout = setTimeout(() => {
      polygonEditorRef.current?.selectPolygonByIndex(0);
    }, 0);

    return () => clearTimeout(timeout);
  }, [isEditingExistingPolygon, polygonEditorRef]);

  const map = (
    <MapViewWithInitialFit
      ref={mapRef}
      style={styles.map}
      initialRegion={initialRegion}
      onPress={onMapPress}
      fitToCoordinatesOnReady={visibleCoordinates}
      fitOnlyOnce={true}
    >
      {editable && polygons.length === 0 && draftCoordinates.length > 0 && (
        <>
          {draftCoordinates.length >= 3 ? (
            <MapPolygon
              coordinates={draftCoordinates}
              strokeColor={newPolygon.strokeColor}
              strokeWidth={newPolygon.strokeWidth}
              fillColor={newPolygon.fillColor}
            />
          ) : (
            <Polyline
              coordinates={draftCoordinates}
              strokeColor={newPolygon.strokeColor}
              strokeWidth={newPolygon.strokeWidth}
            />
          )}
          {draftCoordinates.map((coordinate, index) => (
            <Marker
              key={`draft-point-${index}`}
              coordinate={coordinate}
              anchor={{ x: 0.5, y: 0.5 }}
              tracksViewChanges={false}
            >
              <RNView
                style={[
                  styles.draftPoint,
                  { borderColor: newPolygon.strokeColor },
                ]}
              />
            </Marker>
          ))}
        </>
      )}
      <PolygonEditor
        ref={polygonEditorRef}
        newPolygon={newPolygon}
        polygons={polygons}
        onPolygonCreate={onPolygonCreate}
        onPolygonChange={onPolygonChange}
        onPolygonRemove={onPolygonRemove}
        disabled={!editable}
      />
    </MapViewWithInitialFit>
  );

  const helperText = editable && (
    <Text
      style={styles.helperText}
      textKey={
        hasValue
          ? "dataEntry:geo.editPolygonInstructions"
          : "dataEntry:geo.tapToAddPoints"
      }
    />
  );

  const toolbar = (
    <HView style={styles.toolbar}>
      {(hasValue || editable) && (
        <IconButton
          icon="crosshairs-gps"
          onPress={onCenterOnLocation}
          size={24}
        />
      )}
      {editable ? (
        <Button textKey="common:cancel" onPress={onCancelDrawing} />
      ) : (
        <Button
          icon={hasValue ? "pencil" : "vector-polygon"}
          textKey={
            hasValue ? "dataEntry:geo.editPolygon" : "dataEntry:geo.drawPolygon"
          }
          onPress={onStartDrawing}
        />
      )}
      {hasValue && !editable && (
        <IconButton icon="trash-can-outline" onPress={onClearPress} />
      )}
    </HView>
  );

  return (
    <VView style={styles.container}>
      {isDrawingPolygon ? (
        <Modal
          onDismiss={onCancelDrawing}
          titleKey={
            hasValue ? "dataEntry:geo.editPolygon" : "dataEntry:geo.drawPolygon"
          }
        >
          <VView style={styles.modalContent}>
            {map}
            {helperText}
            {toolbar}
          </VView>
        </Modal>
      ) : hasValue ? (
        <>
          {map}
          {helperText}
          {toolbar}
        </>
      ) : (
        toolbar
      )}
    </VView>
  );
};
