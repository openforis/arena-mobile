import React, { useEffect, useMemo } from "react";
import { View as RNView } from "react-native";

import { PolygonEditor } from "@siposdani87/expo-maps-polygon-editor";
import { Polygon as MapPolygon, Marker, Polyline } from "react-native-maps";

import {
  Button,
  HView,
  IconButton,
  MapViewWithInitialFit,
  Modal,
  Text,
  VView,
} from "components";

import { log } from "utils";
import { NodeComponentProps } from "../nodeComponentPropTypes";
import { useNodeGeoComponent } from "./useNodeGeoComponent";
import styles from "./styles";

export const NodeGeoComponent = (props: NodeComponentProps) => {
  const { nodeDef } = props;
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
    onSaveCurrentPolygon,
    onStartDrawing,
  } = useNodeGeoComponent(props);

  log.debug(`rendering NodeGeoComponent for ${nodeDef.props.name}`);

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
              strokeWidth={Math.max(newPolygon.strokeWidth ?? 2, 4)}
              fillColor={newPolygon.fillColor}
            />
          ) : (
            <Polyline
              coordinates={draftCoordinates}
              strokeColor={newPolygon.strokeColor}
              strokeWidth={Math.max(newPolygon.strokeWidth ?? 2, 4)}
            />
          )}
          {draftCoordinates.map((coordinate, index) => (
            <Marker
              key={`draft-point-${index}`}
              coordinate={coordinate}
              anchor={{ x: 0.3, y: 0.3 }}
            >
              <RNView
                style={[
                  styles.draftPoint,
                  { borderColor: newPolygon.strokeColor },
                ]}
              >
                <RNView
                  style={[
                    styles.draftPointInner,
                    { backgroundColor: newPolygon.strokeColor },
                  ]}
                />
              </RNView>
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
        <>
          {!hasValue && draftCoordinates.length >= 3 && (
            <Button onPress={onSaveCurrentPolygon} textKey="common:save" />
          )}
          <Button
            color="secondary"
            onPress={onCancelDrawing}
            textKey="common:cancel"
          />
        </>
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
