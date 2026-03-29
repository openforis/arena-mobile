import React, { useMemo } from "react";

import { PolygonEditor } from "@siposdani87/expo-maps-polygon-editor";

import { MapViewWithInitialFit, Modal, Text, VView } from "components";

import { log } from "utils";
import { NodeComponentProps } from "../nodeComponentPropTypes";
import { NodeGeoDraftLayer } from "./NodeGeoDraftLayer";
import { NodeGeoMidpointsLayer } from "./NodeGeoMidpointsLayer";
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

  const map = useMemo(
    () => (
      <MapViewWithInitialFit
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        onPress={onMapPress}
        fitToCoordinatesOnReady={visibleCoordinates}
        fitOnlyOnce={true}
      >
        {editable && polygons.length === 0 && (
          <NodeGeoDraftLayer
            draftCoordinates={draftCoordinates}
            newPolygon={newPolygon}
          />
        )}
        {editable && isPolygonSelected && polygons.length > 0 && (
          <NodeGeoMidpointsLayer
            midpoints={polygonMidpoints}
            strokeColor={newPolygon.strokeColor}
            onMidpointPress={onPolygonMidpointPress}
          />
        )}
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
    ),
    [
      mapRef,
      initialRegion,
      onMapPress,
      visibleCoordinates,
      editable,
      polygons,
      draftCoordinates,
      newPolygon,
      isPolygonSelected,
      polygonMidpoints,
      onPolygonMidpointPress,
      polygonEditorRef,
      onPolygonCreate,
      onPolygonChange,
      onPolygonRemove,
      onPolygonSelect,
      onPolygonUnselect,
    ],
  );

  const helperText = useMemo(
    () =>
      editable && (
        <Text
          style={styles.helperText}
          textKey={
            hasValue
              ? isPolygonSelected
                ? "dataEntry:geo.editPolygonInstructions"
                : "dataEntry:geo.selectPolygonInstructions"
              : "dataEntry:geo.tapToAddPoints"
          }
        />
      ),
    [editable, hasValue, isPolygonSelected],
  );

  const toolbar = useMemo(
    () => (
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
    ),
    [
      draftCoordinates,
      editable,
      hasValue,
      onCancelDrawing,
      onCenterOnLocation,
      onClearPress,
      onSaveCurrentPolygon,
      onStartDrawing,
    ],
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
