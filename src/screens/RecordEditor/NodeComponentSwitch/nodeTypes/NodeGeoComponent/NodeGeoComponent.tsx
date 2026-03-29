import React, { useMemo } from "react";
import { View as RNView } from "react-native";

import { PolygonEditor } from "@siposdani87/expo-maps-polygon-editor";
import { Polygon as MapPolygon, Marker, Polyline } from "react-native-maps";

import { MapViewWithInitialFit, Modal, Text, VView } from "components";

import { log } from "utils";
import { NodeComponentProps } from "../nodeComponentPropTypes";
import { NodeGeoToolbar } from "./NodeGeoToolbar";
import { useNodeGeoComponent } from "./useNodeGeoComponent";
import styles from "./styles";

export const NodeGeoComponent = (props: NodeComponentProps) => {
  const { nodeDef } = props;
  const {
    draftCoordinates,
    editable,
    initialRegion,
    isPolygonSelected,
    mapRef,
    newPolygon,
    onMapPress,
    onPolygonMidpointPress,
    onPolygonSelect,
    onPolygonUnselect,
    polygonEditorRef,
    polygonMidpoints,
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
      {editable &&
        isPolygonSelected &&
        polygons.length > 0 &&
        polygonMidpoints.map(({ coordinate, insertAtIndex }, index) => (
          <Marker
            key={`polygon-midpoint-${index}`}
            coordinate={coordinate}
            anchor={{ x: 0.5, y: 0.5 }}
            onPress={onPolygonMidpointPress(insertAtIndex)}
          >
            <RNView
              style={[styles.midpoint, { borderColor: newPolygon.strokeColor }]}
            />
          </Marker>
        ))}
      <PolygonEditor
        ref={polygonEditorRef}
        newPolygon={newPolygon}
        polygons={polygons}
        onPolygonCreate={onPolygonCreate}
        onPolygonChange={onPolygonChange}
        onPolygonRemove={onPolygonRemove}
        onPolygonSelect={onPolygonSelect}
        onPolygonUnselect={onPolygonUnselect}
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
    <NodeGeoToolbar
      draftCoordinates={draftCoordinates}
      editable={editable}
      hasValue={hasValue}
      onCancelDrawing={onCancelDrawing}
      onCenterOnLocation={onCenterOnLocation}
      onClearPress={onClearPress}
      onSaveCurrentPolygon={onSaveCurrentPolygon}
      onStartDrawing={onStartDrawing}
    />
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
